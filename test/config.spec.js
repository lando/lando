/**
 * Tests for config system.
 * @file config.spec.js
 */

'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
const hasher = require('object-hash');
chai.should();

const config = require('./../lib/config');

describe('config', () => {
  describe('#tryConvertJson', () => {
    it('should return the unaltered input if input is not a parsable JSON string', () => {
      const input = 'obiwan';
      const result = config.tryConvertJson(input);
      expect(result).to.be.a('string');
      expect(result).to.equal(input);
    });

    it('should return an object if input is a parsable JSON string representing an object', () => {
      const input = '{}';
      const result = config.tryConvertJson(input);
      expect(result).to.be.an('object');
    });

    it('should return an array if input is a parsable JSON string representing an array', () => {
      const input = '[]';
      const result = config.tryConvertJson(input);
      expect(result).to.be.an('array');
    });
  });

  describe('#merge', () => {
    it('should return the same as _.merge for objects', () => {
      const bands1 = {
        best: 'nickelback',
        worst: 'beck',
      };
      const bands2 = {
        best: 'nickelback',
        worst: 'miley',
        supreme: 'taylor',
      };
      const landoMerge = hasher(config.merge(bands1, bands2));
      const lodashMerge = hasher(_.merge(bands1, bands2));
      expect(landoMerge).to.equal(lodashMerge);
    });

    it('should concatenates keys that are arrays', () => {
      const theworst = {favs: ['nickelback', 'abba']};
      const thebest = {favs: ['britney']};
      const bands = config.merge(theworst, thebest);
      expect(bands.favs).to.have.length(3);
      expect(hasher(bands.favs)).to.equal(hasher(['nickelback', 'abba', 'britney']));
    });

    it('should removes duplicates from cacatenated arrays', () => {
      const myfavs = {favs: ['nickelback', 'abba']};
      const yourfavs = {favs: ['britney', 'nickelback']};
      const ourfavs = config.merge(myfavs, yourfavs);
      expect(ourfavs.favs).to.have.length(3);
      expect(hasher(ourfavs.favs)).to.equal(hasher(['nickelback', 'abba', 'britney']));
    });
  });

  describe('#stripEnvs', () => {
    it('should return process.env stripped of all keys that start with prefix', () => {
      process.env.DANCE_NOW = 'everybody';
      const result = config.stripEnv('DANCE');
      expect(result).to.be.an('object');
      expect(result).to.not.have.key('DANCE_NOW');
      expect(process.env).to.not.have.key('DANCE_NOW');
    });
  });

  describe('#defaults', () => {
    it('should return a properly structured default config object', () => {
      const defaults = config.defaults();
      expect(_.hasIn(defaults, 'composeBin')).to.equal(true);
      expect(_.hasIn(defaults, 'dockerBin')).to.equal(true);
      expect(_.hasIn(defaults, 'dockerBinDir')).to.equal(true);
      expect(_.hasIn(defaults, 'env')).to.equal(true);
      expect(_.hasIn(defaults, 'home')).to.equal(true);
      expect(_.hasIn(defaults, 'logLevel')).to.equal(true);
      expect(_.hasIn(defaults, 'node')).to.equal(true);
      expect(_.hasIn(defaults, 'os')).to.equal(true);
      expect(_.hasIn(defaults, 'os.type')).to.equal(true);
      expect(_.hasIn(defaults, 'os.platform')).to.equal(true);
      expect(_.hasIn(defaults, 'os.release')).to.equal(true);
      expect(_.hasIn(defaults, 'os.arch')).to.equal(true);
      expect(_.hasIn(defaults, 'plugins')).to.equal(true);
      expect(_.hasIn(defaults, 'process')).to.equal(true);
      expect(_.hasIn(defaults, 'userConfRoot')).to.equal(true);
    });

    it('should mirror process.env', () => {
      const env = config.defaults().env;
      expect(hasher(env)).to.equal(hasher(process.env));
      process.env.NEW = 'things';
      expect(hasher(env)).to.equal(hasher(process.env));
      delete process.env.NEW;
      expect(hasher(env)).to.equal(hasher(process.env));
      env.NEW2 = 'morethings';
      expect(hasher(env)).to.equal(hasher(process.env));
      delete env.NEW2;
      expect(hasher(env)).to.equal(hasher(process.env));
    });

    it('config.process should return "browser" if in a browser', () => {
      process.versions.chrome = 'test';
      const processType = config.defaults().process;
      expect(processType).to.equal('browser');
      delete process.versions.chrome;
    });

    it('config.process should return "node" if not in a browser', () => {
      delete process.versions.chrome;
      delete process.versions.electron;
      delete process.versions['atom-shell'];
      const processType = config.defaults().process;
      expect(processType).to.equal('node');
    });
  });

  describe('#getEngineConfig', () => {
    it('should use default engine config if we don\'t have any already');
    it('should default to a named pipe on windows');
    it('should set env.DOCKER_HOST if we ar using a remote docker daemon');
    it('should set appropriate DOCKER envvars if we have certs');
    it('should set engineConfig with cert data if we have certs');
    it('should return an object that dockerode can use to set config');
  });

  describe('#loadFiles', () => {
    it('should return an empty object if no files are specified', () => {
      const fileConfig = config.loadFiles();
      expect(fileConfig).to.be.empty;
    });

    it('should return data only from files that exist', () => {
      filesystem({'/tmp/config1.yml': 'obiwan: kenobi'});
      const fileConfig = config.loadFiles(['/tmp/config1.yml', '/tmp/doesnotexist.yml']);
      expect(hasher(fileConfig)).to.equal(hasher({obiwan: 'kenobi'}));
      filesystem.restore();
    });

    it('should give priority to the last file loaded', () => {
      filesystem({
        '/tmp/config1.yml': 'scoundrel: lando',
        '/tmp/config2.yml': 'scoundrel: solo',
      });
      const fileConfig = config.loadFiles(['/tmp/config1.yml', '/tmp/config2.yml']);
      expect(hasher(fileConfig)).to.equal(hasher({scoundrel: 'solo'}));
      filesystem.restore();
    });
  });

  describe('#loadEnvs', () => {
    it('should return an object built from all keys from process.env that start with a given prefix', () => {
      process.env.DANCE_NOW = 'everybody';
      const result = config.loadEnvs('DANCE');
      expect(result).to.be.an('object');
      expect(result).to.have.key('now');
      expect(result.now).to.equal(process.env.DANCE_NOW);
    });
  });
});
