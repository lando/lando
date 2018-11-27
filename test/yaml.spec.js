/**
 * Tests for yaml module.
 * @file yaml.spec.js
 */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
const fs = require('fs-extra');
const hasher = require('object-hash');
const os = require('os');
const path = require('path');
const Yaml = require('./../lib/yaml');

chai.should();

describe('yaml', () => {
  describe('#Yaml', () => {
    it('should return a Yaml instance with correct default options', () => {
      const yaml = new Yaml();
      yaml.should.be.instanceof(Object);
      yaml.should.have.property('log');
    });
  });

  describe('#load', () => {
    it('should return data from a YAML file as an Object', () => {
      const yaml = new Yaml();
      const content = ['obiwan: kenobi', 'qui:', '- gon', '- jinn'].join(os.EOL);
      filesystem({'/tmp/config1.yml': content});
      const data = yaml.load('/tmp/config1.yml');
      expect(data).to.be.an('Object');
      expect(hasher(data)).to.equal(hasher({obiwan: 'kenobi', qui: ['gon', 'jinn']}));
      filesystem.restore();
    });

    it('should throw an error when file does not exist', () => {
      const yaml = new Yaml({error: () => {
        throw Error();
      }});
      const bogusville = '/tmp/thisalmostcertainlydoesnotexist-3285-2385.yml';
      expect(() => yaml.load(bogusville)).to.throw(Error);
    });
  });

  describe('#dump', () => {
    beforeEach(() => {
      filesystem();
    });

    it('should create the directory for the file if it does not exist', () => {
      const yaml = new Yaml();
      yaml.dump('/tmp/test/file.yml');
      expect(fs.existsSync(path.dirname('/tmp/test/file.yml'))).to.equal(true);
    });

    it('should write a valid YAML file to disk for the object', () => {
      const yaml = new Yaml();
      const data = {obiwan: 'kenobi', qui: ['gon', 'jinn']};
      yaml.dump('/tmp/test/file.yml', data);
      expect(fs.existsSync('/tmp/test/file.yml')).to.equal(true);
      expect(hasher(yaml.load('/tmp/test/file.yml'))).to.equal(hasher(data));
    });

    it('should return the name of the file', () => {
      const yaml = new Yaml();
      const file = yaml.dump('/tmp/test/file.yml', {});
      expect(file).to.equal('/tmp/test/file.yml');
    });

    afterEach(() => {
      filesystem.restore();
    });
  });
});
