/**
 * Tests for updates module.
 * @file updates.spec.js
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.should();

const Github = require('github');
const Promise = require('../../lib/promise');

const UpdateManager = require('./../../lib/updates');
const updates = new UpdateManager();

describe('updates', () => {

  describe('#updateAvailable', () =>  {

    it('checks to see if version 1 is less than version 2', () => {
      updates.updateAvailable('3.0.0', '3.0.1').should.be.true;
      updates.updateAvailable('3.0.1', '3.0.1').should.be.false;
    });

    it('handles non-numeric versions', () => {
      updates.updateAvailable('3.0.0-beta.1', '3.0.0-beta.2').should.be.true;
      updates.updateAvailable('3.0.0-beta.2', '3.0.0-beta.2').should.be.false;
    });

  });

  describe('#fetch', () => {

    it('Returns true if data is undefined', () => {
      updates.fetch().should.be.true;
    });

    it('Determines need to update based on current time vs expiration', () => {
      // Accelerate to 88mph 💥 🚗 🔥🔥🔥🔥
      const clock = sinon.useFakeTimers(new Date('October 26, 1985 01:35:00'));
      // Old Man Peabody
      updates.fetch({expires: new Date('November 5, 1955, 06:15:00')})
        .should.be.true;
      // Where we're going, we don't need roads
      updates.fetch({expires: new Date('October 21, 2015, 16:29:00')})
        .should.be.false;
      // Back to the future
      clock.restore();
    });

  });

  describe('#refresh', function() {
    // We need a Github API Client to stub.
    const github = new Github({Promise: Promise});
    // Use our stubbed Github API so we don't make a real HTTP request.
    updates.githubApi = github;

    it('Does a Barrel Roll if there is an error', function() {

      // Throw an error on purpose
      const stub = sinon.stub(updates.githubApi.repos, 'getReleases')
        .rejects('Whoops!');

      // If something goes wrong with the Github API, handle it gracefully.
      updates.refresh('vlolnotrealversion').should.eventually.be
        .an('object').with.property('version', 'lolnotrealversion');

      stub.restore();
    });

    // @Todo: figure out why this passes no matter what value we pass
    //it('filters out drafts/prereleases', function() {
      //const stub = sinon.stub(updates.githubApi.repos, 'getReleases')
        //.returns(
          //new Promise(() => [
            //{
              //'tag_name': 'vbeta.1',
              //'prerelease': false,
              //'draft': false
            //},
            //{
              //'tag_name': 'vbeta.2',
              //'prerelease': true,
              //'draft': false
            //},
            //{
              //'tag_name': 'vbeta.3',
              //'prerelease': false,
              //'draft': true
            //}
          //]
          //)
        //);

      //updates.refresh('beta.2').should.eventually.be
        //.an('object').with.property('version', 'beta.1');

      //stub.restore();
    //});
  });
});
