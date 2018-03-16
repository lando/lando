/**
 * Tests for lando config file string replacement.
 * @file lando-config-string-replacement.js
 */

'use strict';
const path = require('path');
const fs = require('fs');

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

// Load the yaml tools we'll be using to load the yaml but test functionality.
const yamlTools = require(path.resolve(__dirname, '../lib/yaml.js'))();

// Set where we're writing the test lando file to.
const testLandoPath = path.resolve(__dirname, './.lando.yml');

// Create a temporary app
const app = {
    'name': 'lando-variable-replacement-test',
    'custom_variables': {
        'node_version': 'node:8.9',
        'var2': 'variable-2'
    },
    'a_setting': '${var2}', // eslint-disable-line no-template-curly-in-string
    'services': {
        'node': {
            'type': '${node_version}' // eslint-disable-line no-template-curly-in-string
        },
        'redis': {
            'type': 'redis:4.0'
        }
    }
};


// Write out the temp Lando file...
yamlTools.dump(testLandoPath, app);
// Load the test .lando.yml config file.
const testConfig = yamlTools.load(testLandoPath);

// This is the file we are testing
describe('yaml', function() {

    describe('Test variable replacement in .lando.yml config file', function() {
        // Fire the replace method on the test config file.
        const replacedConfig = yamlTools.replace(testConfig);

        describe('Shallow replacement', function () {
            it('should reflect the declared variable.', function () {
                expect(replacedConfig.a_setting).to.equal('variable-2');
            });
        });

        describe('Deep replacement', function () {
            it('should reflect the declared variable.', function () {
                expect(replacedConfig.services.node.type).to.equal('node:8.9');
            });
        });

    });
});

// Remove the temporary test config file.
fs.unlink(testLandoPath, (err) => {
    if (err) throw err;
console.log(testLandoPath + ' was deleted');
});
