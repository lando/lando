/**
 * Tests for bootstrap system.
 * @file bootstrap.spec.js
 */

'use strict';

const chai = require('chai');
const os = require('os');
const path = require('path');
chai.should();

const bootstrap = require('./../../lib/bootstrap');

describe('bootstrap', () => {
  it('should return a lando object with the default config', () => {
    return bootstrap()
    .then(lando => {
      lando.config.userConfRoot.should.equal(os.tmpdir());
      lando.config.plugins.should.be.an('array').and.be.empty;
    });
  });

  it('should mix envvars into config with set prefix', () => {
    process.env.JOURNEY_PRODUCT = 'steveperry';
    process.env.JOURNEY_MODE = 'rocknroll';
    return bootstrap({envPrefix: 'JOURNEY'})
    .then(lando => {
      lando.config.userConfRoot.should.equal(os.tmpdir());
      lando.config.plugins.should.be.an('array').and.be.empty;
      lando.config.product.should.equal(process.env.JOURNEY_PRODUCT);
      lando.config.mode.should.equal(process.env.JOURNEY_MODE);
      delete process.env.JOURNEY_PRODUCT;
      delete process.env.JOURNEY_MODE;
    });
  });

  it('should mix config files into config', () => {
    const srcRoot = path.resolve(__dirname, '..', '..');
    return bootstrap({
      configSources: [path.resolve(srcRoot, 'config.yml')],
      pluginDirs: [srcRoot],
    })
    .then(lando => {
      lando.config.plugins.should.be.an('array').and.not.be.empty;
      lando.config.stats.should.be.an('array').and.not.be.empty;
      // We need to clear out tasks because it seems to persist from require to require
      lando.tasks.tasks = [];
    });
  });
});
