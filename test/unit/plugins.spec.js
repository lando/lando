/**
 * Tests for plugin system.
 * @file plugins.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
const Plugins = require('./../../lib/plugins');
const plugins = new Plugins();

// This is the file we are testing
describe('plugins', function() {
  describe('#load', function() {
    it('should handle a string for paths to search', function() {
      return plugins.load('test-plugin-one', process.cwd() + '/test/fixtures')
          .should.eventually.resolve;
      });
    });
    it('should handle an array for paths to search', function() {
      return plugins.load('test-plugin-one', [process.cwd() + '/test/fixtures'])
          .should.eventually.resolve;
    });

    it('should look for plugins in reverse order of passed dirs', function() {
      plugins.load('test-plugin-one', [
          process.cwd() + '/test/fixtures',
          process.cwd() + '/test/fixtures/test-app'
      ]).then(function() {
         plugins.loadedModules
          .should
          .contain(process.cwd() + '/test/fixtures/test-app/node_modules/test-plugin-one/index.js')
          .and.not.contain(process.cwd() + '/test/fixtures/plugins/index.js');
      });
    });
  });
