/**
 * Tests for plugin system.
 * @file plugins.spec.js
 */

'use strict';

// Setup chai.
const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const filesystem = require('mock-fs');
chai.use(require('chai-as-promised'));
chai.should();
const os = require('os');
const path = require('path');
const Plugins = require('./../../lib/plugins');
const Promise = require('./../../lib/promise');

const testPlugin = fs.readFileSync(path.resolve('test', 'fixtures', 'plugins', 'test-plugin', 'index.js'));
const searchDirs = [
  path.join(os.tmpdir(), 'dir1'),
  path.join(os.tmpdir(), 'dir2'),
  path.join(process.cwd(), 'test', 'fixtures'),
];
const fsConfig = {};
_.forEach(searchDirs, dir => {
  fsConfig[path.join(dir, 'plugins', 'test-plugin', 'index.js')] = testPlugin;
});

// This is the file we are testing
describe('plugins', () => {
  describe('#load', () => {
    beforeEach(() => {
      filesystem(fsConfig);
      delete global.__webpack_require__;
      delete global.__non_webpack_require__;
    });

    it('should use __non_webpack_require__ if __webpack_require__ is a func', () => {
      const plugins = new Plugins();
      global.__webpack_require__ = sinon.spy();
      global.__non_webpack_require__ = require;
      return plugins.load('test-plugin', searchDirs).should.eventually.resolve;
    });

    it('should handle a string for paths to search', () => {
      const plugins = new Plugins();
      return plugins.load('test-plugin', _.last(searchDirs)).should.eventually.resolve;
    });

    it('should handle an array for paths to search', () => {
      const plugins = new Plugins();
      return plugins.load('test-plugin', searchDirs).should.eventually.resolve;
    });

    it('should use the plugin from the last location it finds it', () => {
      const plugins = new Plugins();
      return plugins.load('test-plugin', searchDirs)
      .then(() => {
        plugins.loadedModules.should.contain(_.last(_.keys(fsConfig)));
      });
    });

    it('should log a warning if plugin is not found', () => {
      const log = {warn: sinon.spy(), debug: sinon.spy()};
      const plugins = new Plugins(log);
      return plugins.load('test-plugin', ['/looks/like/we/are/going/nowhere'])
        .then(() => {
          plugins.log.warn.firstCall.args[0].should.contain('Could not find plugin');
          plugins.log.warn.callCount.should.equal(1);
        })
        .should.eventually.resolve;
    });

    it('should throw an error if dynamic require fails', () => {
      const plugins = new Plugins();
      filesystem();
      sinon.stub(plugins, 'findPlugin').usingPromise(Promise).resolves('/aint/here/index.js');
      return plugins.load('irrelevant', ['somewhere'])
        .should.eventually.be.rejected
        .then(() => plugins.findPlugin.restore());
    });

    afterEach(() => {
      filesystem.restore();
    });
  });
});
