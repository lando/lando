'use strict';

const CliTest = require('command-line-test');
const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const fs = require('fs');
const os = require('os');
const jsYaml = require('js-yaml');

chai.should();

const Docker = require('dockerode');


describe('App Commands', function() {
  this.timeout(50000);
  // Setup a temp dir to play in and tell Mocha where our SUT is.
  before(function() {
    let dockerConfig = {
      host: '127.0.0.1',
      socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'
    };
    if (process.env.CIRCLECI === true) {
      dockerConfig = {
        host: process.env.DOCKER_HOST,
        port: process.env.DOCKER_PORT
      };
    }
    // We sometimes need to inspect Docker environment directly
    this.docker = new Docker(dockerConfig);
    // We want a clean playground
    this.appFolder = fs.mkdtempSync(
      path.join(os.tmpdir(), 'lando-test-'),
      (err, folder) => {
        if (err) { throw err; }
        return folder;
      }
    );

    // Create a temporary app
    const app = {
      'name': 'lando-test',
      'services': {
        'node': {
          'type': 'node:8.9'
        },
        'redis': {
          'type': 'redis:4.0'
        }
      }
    };

    // Write out the temp Lando file...
    fs.writeFileSync(
      `${this.appFolder}${path.sep}.lando.yml`,
      jsYaml.dump(app),
      'utf8',
      err => { if (err) { throw err; } }
    );

    // Use the entry-point in the app, not the globally installed Lando.
    this.executable = path.resolve(
      __dirname, '..', '..', '..', '..', '..', 'bin', 'lando.js'
    );
  });

  // Get a fresh CLI command object before each test.
  beforeEach(function() {
    // We'll need this in all tests
    this.cliTest = new CliTest();
  });

  /**
   * The start command
   */
  describe('#start', function() {
    it('Starts all containers on an app', function() {
      return this.cliTest.execFile(this.executable, ['start'], {cwd: this.appFolder})
      .then(res => {
        const nodeContainer = this.docker.getContainer('landotest_node_1');
        nodeContainer.inspect(function(err, data) {
          if (err) { throw err; }
          return data.State.should.have.property('Status', 'running');
        });
        const redisContainer = this.docker.getContainer('landotest_redis_1');
        redisContainer.inspect(function(err, data) {
          if (err) { throw err; }
          return data.State.should.have.property('Status', 'running');
        });
      });
    });
    // The proxy seems to REALLLLY slow down the test, skip for now.
    it('Provides proxied URLs to the user');
  });

  /**
   * The stop command
   */
  describe('#stop', function() {
    it('Stops all containers on an app', function() {
      return this.cliTest.execFile(this.executable, ['stop'], {cwd: this.appFolder}).then(res => {
        const nodeContainer = this.docker.getContainer('landotest_node_1');
        nodeContainer.inspect(function(err, data) {
          if (err) { throw err; }
          return data.State.should.have.property('Status', 'exited');
        });
        const redisContainer = this.docker.getContainer('landotest_redis_1');
        redisContainer.inspect(function(err, data) {
          if (err) { throw err; }
          return data.State.should.have.property('Status', 'exited');
        });
      });
    });
  });

  /**
   * The destroy command
   */
  describe('#destroy', function() {
    it('Removes all containers', function() {
      return this.cliTest.execFile(this.executable, ['destroy', '-y'], {cwd: this.appFolder})
      .then(res => this.docker.listContainers((err, data) => {
          if (err) { throw err; }
          let ourCotainers = [];
          ourCotainers = data.filter(
            container => container.Names.includes('/landotest_node_1') ||
            container.Names.includes('/landotest_redis_1')
          );
          expect(ourCotainers).to.be.an('array').that.is.empty;
        }));
    });
  });

  /**
   * The info command
   */
  describe('#info', function() {
    before(function() {
      this.cmd = this.cliTest
        .execFile(this.executable, ['info'], {cwd: this.appFolder});
    });

    it('returns json', function() {
      return this.cmd.then(res => {
        // This could get risky as the output could have
        // non-standard JSON we need to trim.
        const getJson = function() {
          JSON.parse(res.stdout);
        };
        expect(getJson).to.not.throw('SyntaxError');
      });
    });

    // @todo: figure out why the fark this fails on CI only?!?!?!
    it('shows info on all services');
      // return this.cmd.then((res) => {
      //   const data = JSON.parse(res.stdout);
      //   data.should.have.property('redis');
      //   data.redis.should.have.property('internal_connection');
      //   return data.should.have.property('node');
      // });
  });

  /**
   * The list command
   */
  describe('#list', function() {
    before(function() {

      // We want a clean playground
      this.secondAppFolder = fs.mkdtempSync(
        path.join(os.tmpdir(), 'lando-test-'),
        (err, folder) => {
          if (err) { throw err; }
          return folder;
        }
      );

      // Create a temporary app
      const secondApp = {
        'name': 'second-lando-test',
        'services': {
          'node': {
            'type': 'node:8.9'
          },
          'redis': {
            'type': 'redis:4.0'
          }
        }
      };

      // Write out the temp Lando file...
      fs.writeFileSync(
        `${this.secondAppFolder}${path.sep}.lando.yml`,
        jsYaml.dump(secondApp),
        'utf8',
        err => { if (err) { throw err; } }
      );

      // Start first app
      this.cliTest.execFile(this.executable, ['list'], {cwd: this.appFolder});

      // Start second app
      this.cmd = this.cliTest
        .execFile(this.executable, ['list'], {cwd: this.secondAppFolder});
    });

    it('returns json', function() {
      return this.cmd.then(res => {
        // This could get risky as the output could have
        // non-standard JSON we need to trim.
        const getJson = function() {
          JSON.parse(res.stdout);
        };
        expect(getJson).to.not.throw('SyntaxError');
      });
    });

    it('lists all running apps', function() {
      return this.cmd.then(res => {
        const data = JSON.parse(res.stdout);
        // Dev could have other apps running,
        // we just want to ensure the apps that are part of the test suite are listed
        const ourApps = data.filter(app => app.name === 'lando-test' || app.name === 'second-lando-test');
        ourApps.should.have.lengthOf(2);
      });
    });
  });

  /**
   * The logs command
   */
  describe('#logs', function() {
    before(function() {
      // We need to make sure to start the app to get a bit of output to collect
      this.cliTest.execFile(this.executable, ['start'], {cwd: this.appFolder});
      this.cmd = this.cliTest.execFile(this.executable, ['logs'], {cwd: this.appFolder});
    });

    it('shows logs for all containers');
     //  this.cmd.then((res) => {
        // return res.stdout.should
          // .match(/landotest_node_1/)
          // .and
          // .match(/landotest_redis_1/);
        // });

    it('filters by service');
      // this.cliTest.execFile(this.executable, ['logs', '-s', 'node'], {cwd: this.appFolder})
      // .then((res) => {
      //  return res.should
        //  .match('/landotest_node_1')
         // .but
         // .not
          //.match('/landotest_redis_1/');
      // });


    it('can show/hide timestamps');
      // this.cliTest.execFile(this.executable, ['logs', '-t'], {cwd: this.appFolder})
      // .then((res) => {
        // return res.should.match(/sometimestampregex/);
      // });


    it('can follow logs');
  });

  /**
   * The poweroff command
   */
  describe('#poweroff', function() {
    before(function() {
      this.cmd = this.cliTest.execFile(
        this.executable,
        ['poweroff'],
        {cwd: this.appFolder}
      );
    });

    it('powers down all containers including proxy');
      // return this.cmd.then((res) => {
      // });

  });

  /**
   * The rebuild command
   */
  describe('#rebuild', function() {
    it('stops, removes, and rebuilds all containers');
  });

  /**
   * The restart command
   */
  describe('#restart', function() {
    it('stops and starts all app services');
  });

  /**
   * The share command
   */
  describe('#share', function() {
    it('serves a site via a globally accessible URL');
  });
});
