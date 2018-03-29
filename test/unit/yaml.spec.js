/**
 * Tests for yaml module.
 * @file yaml.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
const fs = require('fs-extra');
const hasher = require('object-hash');
const os = require('os');
const path = require('path');
chai.should();

// Get yaml module to test
const yaml = require('./../../lib/yaml')({error: () => {}});

// This is the file we are testing
describe('yaml', () => {

  describe('#load', () => {

    it('returns data from a YAML file as an Object', () => {

      // Spoof some filezz
      const content = ['obiwan: kenobi', 'qui:', '- gon', '- jinn'].join(os.EOL);
      filesystem({'/tmp/config1.yml': content});

      // Load the file
      const data = yaml.load('/tmp/config1.yml');

      // Assert the things
      expect(data).to.be.an('Object');
      expect(hasher(data)).to.equal(hasher({obiwan: 'kenobi', qui: ['gon', 'jinn']}));

      // Restore the filesystem
      filesystem.restore();

    });

    it('returns undefined when file does not exist', () => {

      // Load the file
      const data = yaml.load('/tmp/thisalmostcertainlydoesnotexist-3285-2385.yml');

      // Assert the things
      expect(data).to.be.an('undefined');

    });

  });

  describe('#dump', () => {

    // Mock the filesystem
    beforeEach(() => {
      filesystem();
    });


    it('creates the directory for the file if it does not exist', () => {

      // Dump the file
      yaml.dump('/tmp/test/file.yml', {});

      // Great expectations
      expect(fs.existsSync(path.dirname('/tmp/test/file.yml'))).to.equal(true);

    });

    it('writes a valid YAML file to disk for the object', () => {

      // Dump the file
      const data = {obiwan: 'kenobi', qui: ['gon', 'jinn']};
      yaml.dump('/tmp/test/file.yml', data);

      // Great expectations
      expect(fs.existsSync('/tmp/test/file.yml')).to.equal(true);
      expect(hasher(yaml.load('/tmp/test/file.yml'))).to.equal(hasher(data));

    });

    it('returns the name of the file', () => {

      // Dump the file
      const file = yaml.dump('/tmp/test/file.yml', {});

      // Great expectations
      expect(file).to.equal('/tmp/test/file.yml');

    });

    // Restore filesystem
    afterEach(() => {
      filesystem.restore();
    });

  });

});
