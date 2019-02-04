/*
 * Tests for compose.
 * @file compose.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

const compose = require('./../lib/compose');

const myOpts = {
  'id': 'appname_service_1',
  'pull': true,
  'services': {
    'appserver': {},
  },
  'app': {
    'services': 'someappthathasnohopeofexisting',
  },
  'build': {},
  'cmd': [
    'drush',
    'b',
  ],
  'entrypoint': [],
  'pre': 'drush',
  'environment': 'dev',
  'rm': true,
  'noDeps': true,
  'timestamps': true,
  'follow': true,
  'nocache': true,
};

describe('compose', () => {
  // These are some general things we want to check
  // @geoff/dustin i'd recommend looping through all the exports functions and checking the same conditions
  // then we can check only a few easy things for each command
  // it's possible this will allow us to remove a lot of the current tests
  it('should include a --project for every command');
  it('should include potentially more than one --file for every command');
  it('should include potentially more than one -e for every command when opts.environment is set');
  it('should include a --user for every command when opts.user is set');
  it('should include a string escaped --entrypoint for every command when opts.entrypoint is set');
  it('should include services as arguments when opts.services is set for every command');
  // @note: its possible that it is ok for the below to work on all commands because we don't ever set it except on run
  it('should include a command as an argument when opts.cmd is set for the run command');
  it('should return an object with array cmd and object opts');

  describe('#build', () => {
    it('should return the correct default options when not specified');
    it('#build should return an object.', () => {
      const buildResult = compose.build(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(buildResult).to.be.an('object');
    });

    it('#build should throw and error if project string is not defined.', () => {
      expect(() => {
        compose.build(
          ['string test'],
          null,
          myOpts
        );
      }).to.throw(Error);
    });
  });

  describe('#getId', () => {
    it('should return the correct default options when not specified');
    it('#getId should return an object.', () => {
      const getIdResult = compose.getId(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(getIdResult).to.be.an('object');
    });
  });

  describe('#logs', () => {
    it('should return the correct default options when not specified');
    it('#logs should return an object.', () => {
      const logsResult = compose.logs(['string1', 'string2'], 'my_project', {'pull': true});
      expect(logsResult).to.be.an('object');
    });
  });

  describe('#pull', () => {
    it('should return the correct default options when not specified');
    it('should only pull services specified by the user in opts.services');
    it('should not pull any services that are beind built locally');
    it('#pull should return an object.', () => {
      const pullResult = compose.pull(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(pullResult).to.be.an('object');
    });
  });

  describe('#remove', () => {
    // @note: the two below seem backawards? eg purge = true -> remove?
    it('should use down when opts.purge is true');
    it('should use rm when opts.purge is false');
    it('should return the correct default options for down when not specified');
    it('should return the correct default options for remove when not specified');
    it('#remove should return an object.', () => {
      const removeResult = compose.remove(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(removeResult).to.be.an('object');
    });
  });

  describe('#run', () => {
    it('should return the correct default options when not specified');
    it('should correctly escape opts.cmd');
    it('should prefix any opts.pre to opts.cmd');
    it('should set opts.cmd into an array at index 2 with /bin/sh and -c as indeces 0 and 1');
    it('#run should return an object.', () => {
      const runResult = compose.run(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(runResult).to.be.an('object');
    });
  });

  describe('#start', () => {
    it('should return the correct default options when not specified');
    it('#start should return an object.', () => {
      const startResult = compose.start(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(startResult).to.be.an('object');
    });

    it('#start without options should work.', () => {
      const startResult = compose.start(
        ['string'],
        'a_project',
        false
      );
      expect(startResult).to.be.an('object');
    });

    it('#start with entrypoint as a string should return an object.', () => {
      myOpts.entrypoint = 'astring';
      myOpts.cmd = 'acommand';
      const startResult = compose.start(
        ['string test'],
        'another_project',
        myOpts
      );
      expect(startResult).to.be.an('object');
      myOpts.entrypoint = [];
    });

    it('#start with no opts (false).', () => {
      const startResult = compose.start(
        ['string test'],
        'another_project',
        myOpts
      );
      expect(startResult).to.be.an('object');
    });

    it('#start with cmd as a string should still return and object.', () => {
      myOpts.cmd = ['cmdstring'];
      const startResult = compose.start(
        ['string test'],
        'one_project_more',
        myOpts
      );
      expect(startResult).to.be.an('object');
      myOpts.cmd = ['one', 'two'];
    });
  });

  describe('#stop', () => {
    it('should return the correct default options when not specified');
    it('#stop should return an object.', () => {
      const stopResult = compose.stop(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(stopResult).to.be.an('object');
    });
  });
});
