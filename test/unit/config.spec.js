/**
 * Tests for config system.
 * @file config.spec.js
 */

'use strict';

// Setup chai.
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
const hasher = require('object-hash');
chai.should();

// Get caching module to test
const config = require('./../../lib/config');

// This is the file we are testing
describe('config', () => {

  describe('#tryConvertJson', () => {

    it('returns the unaltered input if input is not a parsable JSON string', () => {

      // Input value
      const input = 'obiwan';

      // Get the result of a JSON parse
      const result = config.tryConvertJson(input);

      // What were you expecting?
      expect(result).to.be.a('string');
      expect(result).to.equal(input);

    });

    // NOTE: means the JSON string is enclosed by {}
    it('returns an object if input is a parsable JSON string representing an object', () => {

      // Input value
      const input = '{}';

      // Get the result of a JSON parse
      const result = config.tryConvertJson(input);

      // What were you expecting?
      expect(result).to.be.an('object');

    });

    // NOTE: means the JSON string is enclosed by []
    it('returns an array if input is a parsable JSON string representing an array', () => {

      // Input value
      const input = '[]';

      // Get the result of a JSON parse
      const result = config.tryConvertJson(input);

      // What were you expecting?
      expect(result).to.be.an('array');

    });

  });

  describe('#merge', () => {

    it('returns the same as _.merge for objects', () => {

      // Setup data
      const bands1 = {
        best: 'nickelback',
        worst: 'beck',
      };
      const bands2 = {
        best: 'nickelback',
        worst: 'miley',
        supreme: 'taylor'
      };

      // Call the merge
      const landoMerge = hasher(config.merge(bands1, bands2));
      const lodashMerge = hasher(_.merge(bands1, bands2));

      // Assert the things
      expect(landoMerge).to.equal(lodashMerge);

    });

    it('concatenates keys that are arrays', () => {

      // Setup data
      const theworst = {favs: ['nickelback', 'abba']};
      const thebest = {favs: ['britney']};

      // Call the merge
      const bands = config.merge(theworst, thebest);

      // Assert the things
      expect(bands.favs).to.have.length(3);
      expect(hasher(bands.favs)).to.equal(hasher(['nickelback', 'abba', 'britney']));

    });

    it('removes duplicates from cacatenated arrays', () => {

      // Setup data
      const myfavs = {favs: ['nickelback', 'abba']};
      const yourfavs = {favs: ['britney', 'nickelback']};

      // Call the merge
      const ourfavs = config.merge(myfavs, yourfavs);

      // Assert the things
      expect(ourfavs.favs).to.have.length(3);
      expect(hasher(ourfavs.favs)).to.equal(hasher(['nickelback', 'abba', 'britney']));

    });

  });

  describe('#stripEnvs', () => {

    it('returns process.env stripped of all keys that start with prefix', () => {

      // Add mock data to process.env
      process.env.DANCE_NOW = 'everybody';

      const result = config.stripEnv('DANCE');

      expect(result).to.be.an('object');
      expect(result).to.not.have.key('DANCE_NOW');
      expect(process.env).to.not.have.key('DANCE_NOW');

    });

  });

  describe('#defaults', () => {

    it('returns a properly structured default config object', () => {

      // GEt teh config
      const defaults = config.defaults();

      // Assert the things
      expect(_.hasIn(defaults, 'configFilename')).to.equal(true);
      expect(_.hasIn(defaults, 'configSources')).to.equal(true);
      expect(_.hasIn(defaults, 'env')).to.equal(true);
      expect(_.hasIn(defaults, 'home')).to.equal(true);
      expect(_.hasIn(defaults, 'logLevel')).to.equal(true);
      expect(_.hasIn(defaults, 'logLevelConsole')).to.equal(true);
      expect(_.hasIn(defaults, 'node')).to.equal(true);
      expect(_.hasIn(defaults, 'os')).to.equal(true);
      expect(_.hasIn(defaults, 'os.type')).to.equal(true);
      expect(_.hasIn(defaults, 'os.platform')).to.equal(true);
      expect(_.hasIn(defaults, 'os.release')).to.equal(true);
      expect(_.hasIn(defaults, 'os.arch')).to.equal(true);
      expect(_.hasIn(defaults, 'pluginDirs')).to.equal(true);
      expect(_.hasIn(defaults, 'product')).to.equal(true);
      expect(_.hasIn(defaults, 'process')).to.equal(true);
      expect(_.hasIn(defaults, 'srcRoot')).to.equal(true);
      expect(_.hasIn(defaults, 'userConfRoot')).to.equal(true);

    });

    it('config.env mirrors process.env', () => {

      // GEt the env config
      const env = config.defaults().env;

      // Compare config.env and process.env
      expect(hasher(env)).to.equal(hasher(process.env));

      // Add a property to process.env and recompare
      process.env.NEW = 'things';
      expect(hasher(env)).to.equal(hasher(process.env));

      // Remove a property from process.env and recompare
      delete process.env.NEW;
      expect(hasher(env)).to.equal(hasher(process.env));

      // Add a property to process.env and recompare
      env.NEW2 = 'morethings';
      expect(hasher(env)).to.equal(hasher(process.env));

      // Remove a property from process.env and recompare
      delete env.NEW2;
      expect(hasher(env)).to.equal(hasher(process.env));

    });

    it('config.process returns "browser" if in a browser', () => {
      process.versions.chrome = 'test';
      const processType = config.defaults().process;
      expect(processType).to.equal('browser');
      delete process.versions.chrome;
    });

    it('config.process returns "node" if not in a browser', () => {
      delete process.versions.chrome;
      delete process.versions.electron;
      delete process.versions['atom-shell'];
      const processType = config.defaults().process;
      expect(processType).to.equal('node');
    });

  });

  describe('#loadFiles', () => {

    it('returns an empty object if no files are specified', () => {
      const fileConfig = config.loadFiles();
      expect(fileConfig).to.be.empty;
    });

    it('returns data only from files that exist', () => {

      // Spoof some filezz
      filesystem({'/tmp/config1.yml': 'obiwan: kenobi'});

      // Build the file config
      const fileConfig = config.loadFiles(['/tmp/config1.yml', '/tmp/doesnotexist.yml']);

      // Assert
      expect(hasher(fileConfig)).to.equal(hasher({obiwan: 'kenobi'}));

      // Restore the filesystem
      filesystem.restore();

    });

    it('gives priority to the last file loaded', () => {

      // Spoof some filezz
      filesystem({
        '/tmp/config1.yml': 'scoundrel: lando',
        '/tmp/config2.yml': 'scoundrel: solo'
      });

      // Build the file config
      const fileConfig = config.loadFiles(['/tmp/config1.yml', '/tmp/config2.yml']);

      // Assert
      expect(hasher(fileConfig)).to.equal(hasher({scoundrel: 'solo'}));

      // Restore the filesystem
      filesystem.restore();

    });

  });

  describe('#loadEnvs', () => {

    it('returns an object built from all keys from process.env that start with a given prefix', () => {

      // Add mock data to process.env
      process.env.DANCE_NOW = 'everybody';

      const result = config.loadEnvs('DANCE');

      expect(result).to.be.an('object');
      expect(result).to.have.key('now');
      expect(result.now).to.equal(process.env.DANCE_NOW);

    });

  });

});
