/**
 * Tests for lando config file string replacement.
 * @file lando-config-string-replacement.js
 */

'use strict';

var assert = require('assert');
var path = require('path');
var yamlTools = require(path.resolve(__dirname, '../lib/yaml.js'))();
// Load the test .lando.yml config file.
var testConfig = yamlTools.load(path.resolve(__dirname, './.lando.yml'));

// This is the file we are testing
describe('yaml.js / replace method – Test variable replacement in .lando.yml config file', function() {

    // Fire the replace method on the test config file.
    var replacedConfig = yamlTools.replace(testConfig);

    describe('Shallow replacement', function() {
        it('should reflect the declared variable.', function() {
            assert.equal(replacedConfig.name, 'testingtesting.dev');
        });
    });

    describe('Deep replacement', function() {
        it('should reflect the declared variable.', function() {
            assert.equal(replacedConfig.services.appserver.type, 'testingtesting');
        });
    });
});
