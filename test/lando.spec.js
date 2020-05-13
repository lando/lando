/**
 * Tests for lando system.
 * @file lando.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const filesystem = require('mock-fs');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Lando = require('./../lib/lando');
chai.use(require('chai-as-promised'));
chai.should();

// This is the file we are testing
describe('lando', () => {
  describe('#Lando', () => {
    // @todo: do we need a stronger test? presumably downstream requires handle that?
    it('should return a Lando instance with correct default options', () => {
      const lando = new Lando();
      lando.should.be.an.instanceof(Lando);
    });

    it('should use prexisting instance id if possible', () => {
      filesystem({
        '/tmp/cache/id': '"24601"',
      });
      const lando = new Lando({userConfRoot: '/tmp'});
      lando.config.id.should.equal('24601');
      lando.config.user.should.equal('24601');
      filesystem.restore();
    });

    it('should set and persitent cache an instance id if needed', () => {
      filesystem();
      const lando = new Lando({userConfRoot: os.tmpdir()});
      const idPath = path.join(lando.config.userConfRoot, 'cache', 'id');
      fs.existsSync(idPath).should.be.true;
      lando.cache.get('id').should.equal(lando.config.id);
      filesystem.restore();
    });
  });

  describe('#bootstrap', () => {
    it('should return a lando object with the default config', () => {
      const lando = new Lando({logLevelConsole: 'warn'});
      return lando.bootstrap().then(lando => {
        lando.config.userConfRoot.should.equal(os.tmpdir());
        lando.config.plugins.should.be.an('array').and.be.empty;
      });
    });

    it('should mix envvars into config with set prefix', () => {
      process.env.JOURNEY_PRODUCT = 'steveperry';
      process.env.JOURNEY_MODE = 'rocknroll';
      const lando = new Lando({envPrefix: 'JOURNEY'});
      return lando.bootstrap().then(lando => {
        lando.config.userConfRoot.should.equal(os.tmpdir());
        lando.config.plugins.should.be.an('array').and.be.empty;
        lando.config.product.should.equal(process.env.JOURNEY_PRODUCT);
        lando.config.mode.should.equal(process.env.JOURNEY_MODE);
        delete process.env.JOURNEY_PRODUCT;
        delete process.env.JOURNEY_MODE;
      });
    });

    it('should mix config files into config', () => {
      const srcRoot = path.resolve(__dirname, '..');
      // @TODO: the below should be mock-fs instead of the actual FS
      const lando = new Lando({
        configSources: [path.resolve(srcRoot, 'config.yml')],
        pluginDirs: [srcRoot],
      });
      return lando.bootstrap().then(lando => {
        lando.config.stats.should.be.an('array').and.not.be.empty;
        // We need to clear out tasks because it seems to persist from require to require
        lando.tasks.tasks = [];
      });
    });
  });
});
