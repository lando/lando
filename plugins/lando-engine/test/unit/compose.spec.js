/*
 * Tests for lando-engine:compose.
 * @file compose.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

// Get the compose module to test.
const compose = require('./../../lib/compose');

const myOpts = {
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

// This is the file we are testing
describe('lando-engine.compose', () => {
  describe('#start', () => {
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

  describe('#getId', () => {
    it('#getId should return an object.', () => {
      const getIdResult = compose.getId(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(getIdResult).to.be.an('object');
    });
  });

  describe('#build', () => {
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

  describe('#pull', () => {
    it('#pull should return an object.', () => {
      const pullResult = compose.pull(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(pullResult).to.be.an('object');
    });
  });

  describe('#stop', () => {
    it('#stop should return an object.', () => {
      const stopResult = compose.stop(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(stopResult).to.be.an('object');
    });
  });

  describe('#run', () => {
    it('#run should return an object.', () => {
      const runResult = compose.run(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(runResult).to.be.an('object');
    });
  });

  describe('#logs', () => {
    it('#logs should return an object.', () => {
      const logsResult = compose.logs(['string1', 'string2'], 'my_project', {'pull': true});
      expect(logsResult).to.be.an('object');
    });
  });

  describe('#remove', () => {
    it('#remove should return an object.', () => {
      const removeResult = compose.remove(
        ['string1', 'string2'],
        'my_project',
        myOpts
      );
      expect(removeResult).to.be.an('object');
    });
  });
});
