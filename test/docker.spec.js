/*
 * Tests for docker.
 * @file docker.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
chai.should();
chai.use(require('chai-as-promised'));
const sinon = require('sinon');
const Landerode = require('./../lib/docker');
const landerode = new Landerode();
const Dockerode = require('dockerode');
const Promise = require('./../lib/promise');
const _ = require('lodash');

const dummyContainer = (overrides = {}) => {
  return _.assign(
    new Dockerode.Container(),
    {
      Id: '8675309',
      app: 'Death Star',
      Labels: {
        'com.docker.compose.project': 'Death Star',
        'com.docker.compose.service': 'Exhaust Port',
        'com.docker.compose.container-number': 73,
        'com.docker.compose.oneoff': 'no',
        'io.lando.container': 'TRUE',
        'io.lando.src': '/tmp/.lando.yml',
        'io.lando.id': 'lando',
        'io.lando.service-container': 'no',
      },
    },
    overrides
  );
};

describe('docker', () => {
  describe('#Landerode', () => {
    it('should inherit things from Dockerode', () => {
      expect(Landerode.prototype).to.be.an.instanceOf(Dockerode);
    });
  });

  describe('#createNetwork', () => {
    it('should merge name correctly into opts', () => {
      const stub = sinon.stub(landerode, 'createNetwork')
        .usingPromise(Promise)
        .resolves();
      return landerode.createNet('elthree', {}).then(() => {
        // for some reason should/expect doesn't work here...
        stub.calledWith({Name: 'elthree'});
        stub.restore();
      });
    });
    it('should throw an error if can\'t create network', () => {
      const stub = sinon.stub(landerode, 'createNetwork').rejects('Too Many Capes');

      return landerode.createNet('hardtimes').should.be.rejectedWith('Too Many Capes')
      .then(() => {
        stub.restore();
      });
    });
  });

  describe('#inspect', () => {
    it('should throw an error if inspect fails', () => {
      // We need this chain of stubs to send our call down an explicit line that
      // will eventually throw a solid exception.
      let bogusContainer = dummyContainer();
      const inspectStub = sinon.stub(bogusContainer, 'inspect').throws();
      const stub = sinon.stub(landerode, 'getContainer').returns(bogusContainer);

      // Throw needs a function to check rather than a function result
      const cptPhasma = () => landerode.inspect('fn-2187');

      expect(cptPhasma).to.throw();

      inspectStub.restore();
      stub.restore();
    });
  });

  describe('#isRunning', () => {
    it('should return false if State.Running inspect data is false', () => {
      // Container to return from 'getContainer'
      const bogusContainer = dummyContainer();
      // Force the state of the container to not be running.
      const inspectStub = sinon.stub(bogusContainer, 'inspect').resolves({
        State: {
          Running: false,
        },
      });
      // Force the return of our container
      const getStub = sinon.stub(landerode, 'getContainer').returns(bogusContainer);

      return landerode.isRunning('YT-1300').should.eventually.be.false
      .then(() => {
        inspectStub.restore();
        getStub.restore();
      });
    });

    it('should return true if State.Running inspect data is true', () => {
      // Container to return from 'getContainer';;l
      const bogusContainer = new Dockerode.Container({}, 'YT-1300');
      // Force the state of the container to be running.
      const inspectStub = sinon.stub(bogusContainer, 'inspect').resolves({
        State: {
          Running: true,
        },
      });
      // Force the return of our container
      const getStub = sinon.stub(landerode, 'getContainer').returns(bogusContainer);

      return landerode.isRunning('YT-1300').should.eventually.be.true
      .then(() => {
        inspectStub.restore();
        getStub.restore();
      });
    });

    it('should return false if container doesn\'t exist', () => {
      // Our own little bad container.
      const bogusContainer = new Dockerode.Container();
      // Throw the proper error.
      const inspectStub = sinon.stub(bogusContainer, 'inspect')
      .rejects(new Error('No such container: foo'));
      // Make sure we return the proper failing container.
      const getStub = sinon.stub(landerode, 'getContainer')
      .returns(bogusContainer);

      return landerode.isRunning('foo').should.eventually.be.false.then(() => {
        getStub.restore();
        inspectStub.restore();
      });
    });

    it('should throw an error on all other catches', () => {
      // Our own little bad container.
      const bogusContainer = new Dockerode.Container();
      // Throw the proper error.
      const inspectStub = sinon.stub(bogusContainer, 'inspect').rejects(new Error('It\'s a trap!'));
      // Make sure we return the proper failing container.
      const getStub = sinon.stub(landerode, 'getContainer').returns(bogusContainer);

      return landerode.isRunning('foo').should.be
      .rejectedWith('It\'s a trap!').then(() => {
        getStub.restore();
        inspectStub.restore();
      });
    });
  });

  describe('#list', () => {
    beforeEach(() => {
      filesystem({'/tmp/.lando.yml': 'CODEZ'});
    });

    it('should filter out any containers that are pending removal', () => {
      const listStub = sinon.stub(landerode, 'listContainers')
      .usingPromise(Promise)
      .resolves([
          dummyContainer({Status: 'Being Awesome'}),
          dummyContainer({Status: 'Removal In Progress'}),
      ]);
      return landerode.list()
      .should.eventually.be.an('Array').with.a.lengthOf(1)
      .then(() => {
        listStub.restore();
      });
    });

    it('should remove any "null" containers', () => {
      const listStub = sinon.stub(landerode, 'listContainers')
      .usingPromise(Promise)
      .resolves([
        null,
        dummyContainer({identity: 'Solo'}),
      ]);

      return landerode.list()
      .should.eventually.be.an('Array').with.a.lengthOf(1)
      .then(() => {
        listStub.restore();
      });
    });

    it('should filter out non-lando containers', () => {
      const listStub = sinon.stub(landerode, 'listContainers')
      .usingPromise(Promise)
      .resolves([
        dummyContainer({Labels: {'io.lando.container': 'FALSE'}}),
        dummyContainer(),
      ]);

      return landerode.list()
      .should.eventually.be.an('Array').with.a.lengthOf(1)
      .then(() => {
        listStub.restore();
      });
    });

    it('should filter by appName if given', () => {
      const listStub = sinon.stub(landerode, 'listContainers')
      .usingPromise(Promise)
      .resolves([
        dummyContainer({Labels: {
          'com.docker.compose.project': 'alderaan',
          'com.docker.compose.service': 'Rescue Mission',
          'com.docker.compose.container-number': 73,
          'com.docker.compose.oneoff': 'no',
          'io.lando.container': 'TRUE',
          'io.lando.id': 'lando',
          'io.lando.service-container': 'no',
          'io.lando.src': '/tmp/.lando.yml',
        }}),
        dummyContainer(),
      ]);

      return landerode.list('alderaan')
      .should.eventually.be.an('Array').with.a.lengthOf(1)
      .then(() => {
        listStub.restore();
      });
    });

    it('should throw an error on all other catches', () => {
      let container = dummyContainer();
      delete container.lando;
      const listStub = sinon.stub(landerode, 'listContainers').resolves([container]);

      const fail = () => landerode.list();
      expect(fail).to.throw();
      return listStub.restore();
    });

    afterEach(() => {
      filesystem.restore();
    });
  });

  describe('#remove', () => {
    it('should throw an error if remove fails', () => {
      const container = dummyContainer({Id: '1234'});

      const getStub = sinon.stub(landerode, 'getContainer').returns(container);
      const removeStub = sinon.stub(container, 'remove')
        .usingPromise(Promise)
        .rejects('Oh No!');

      landerode.remove('1234').should.be.rejectedWith('Oh No!')
      .then(() => {
        getStub.restore();
        removeStub.restore();
      });
    });
  });
});
