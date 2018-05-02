/**
 * Tests for tasks module.
 * @file tasks.spec.js
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const Github = require('github');
const Promise = require('../../lib/promise');
chai.should();

const UpdateManager = require('./../../lib/updates');
const updates = new UpdateManager();

describe('updates', () => {

  describe('#updateAvailable', () =>  {

    it('checks to see if version 1 is less than version 2', () => {
      UpdateManager.updateAvailable('3.0.0', '3.0.1').should.be.true;
      UpdateManager.updateAvailable('3.0.1', '3.0.1').should.be.false;
    });

    it('handles non-numeric versions', () => {
      UpdateManager.updateAvailable('3.0.0-beta.1', '3.0.0-beta.2').should.be.true;
      UpdateManager.updateAvailable('3.0.0-beta.2', '3.0.0-beta.2').should.be.false;
    });

  });

  describe('#fetch', () => {

    it('Returns true if data is undefined', () => {
      UpdateManager.fetch().should.be.true;
    });

    it('Determines need to update based on current time vs expiration', () => {
      // Accelerate to 88mph 💥 🚗 🔥🔥🔥🔥
      const clock = sinon.useFakeTimers(new Date('October 26, 1985 01:35:00'));
      // Old Man Peabody
      UpdateManager.fetch({expires: new Date('November 5, 1955, 06:15:00')})
        .should.be.true;
      // Where we're going, we don't need roads
      UpdateManager.fetch({expires: new Date('October 21, 2015, 16:29:00')})
        .should.be.false;
      // Back to the future
      clock.restore();
    });

  });

  describe('#refresh', () => {

    it('Does a Barrel Roll if there is an error', function() {
      // We need a Github API Client to stub.
      const github = new Github({Promise: Promise});
      // Use our stubbed Github API so we don't make a real HTTP request.
      updates.githubApi = github;
      // Throw an error on purpose
      sinon.stub(updates.githubApi.repos, 'getReleases').rejects('Whoops!');
      // If something goes wrong with the Github API, handle it gracefully.
      updates.refresh('vlolnotrealversion')
        .then(res => res.should.be.an('object').with.property('version', 'vlolnotrealversion'));
    });

    it('')

  });
});
