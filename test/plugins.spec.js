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
const expect = chai.expect;
const filesystem = require('mock-fs');
chai.use(require('chai-as-promised'));
chai.should();
const os = require('os');
const path = require('path');
const Plugins = require('./../lib/plugins');

const testPlugin = fs.readFileSync(path.resolve(__dirname, '..', 'plugins', 'lando-test', 'index.js'), 'utf8');
const searchDirs = [
  path.join(os.tmpdir(), 'dir1'),
  path.join(os.tmpdir(), 'dir2'),
  path.resolve(__dirname, '..'),
];
const fsConfig = {};
_.forEach(searchDirs, dir => {
  fsConfig[path.join(dir, 'plugins', 'lando-test', 'index.js')] = testPlugin;
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
      const find = plugins.find(searchDirs);
      global.__webpack_require__ = sinon.spy();
      global.__non_webpack_require__ = require;
      const data = plugins.load(find[0]);
      data.should.be.an('Object');
      data.data['plugin-test'].should.be.true;
      data.name.should.equal(find[0].name);
      data.path.should.equal(find[0].path);
      data.dir.should.equal(find[0].dir);
    });

    it('should use the plugin from the last location it finds it', () => {
      const plugins = new Plugins();
      const find = plugins.find(searchDirs);
      expect(_.includes(find[0].path, 'lando/plugins')).to.be.true;
    });

    it('should push a plugin to the plugin registry after it is loaded', () => {
      const plugins = new Plugins();
      const find = plugins.find(searchDirs);
      global.__webpack_require__ = sinon.spy();
      global.__non_webpack_require__ = require;
      plugins.load(find[0]);
      plugins.registry.should.be.lengthOf(1);
    });

    it('should throw an error if dynamic require fails', () => {
      filesystem();
      const plugins = new Plugins({
        silly: sinon.spy(),
        debug: sinon.spy(),
        error: sinon.spy(),
        verbose: sinon.spy(),
      });
      plugins.load('irrelevant', 'somewhere', {});
      plugins.log.error.callCount.should.equal(1);
    });

    afterEach(() => {
      filesystem.restore();
    });
  });
});
