/**
 * Tests for cache system.
 * @file cache.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

// Load the config methods.
const config = require('./../lib/config');


// This is the file we are testing
describe('config', function() {

    describe('getSysConfRoot', function() {
        const supportedOSs = [process.platform, 'win32', 'darwin', 'linux'];

        before(function() {
            // Store the platform for restoring later.
            this.originalPlatform = process.platform;
        });

        supportedOSs.forEach((os) => {
            it('returns the sysConfRoot based on path for os – ' + os, function() {
                Object.defineProperty(process, 'platform', {value: os});
                if (os === 'win32') {
                    // Mock extra windows stuff.
                    // @TODO: remove when decision is made on config.js line 174.
                    process.env.LOCALAPPDATA = 'LOCALAPPDATA';
                    process.env.ProgramFiles = 'ProgramFiles';
                    process.env.ProgramW6432 = 'ProgramW6432';
                }
                const theDefaults = config.defaults();
                const getSysConfRootData = theDefaults.sysConfRoot;

                // First make sure it's a string.
                expect(getSysConfRootData).to.be.a('string');

                // Check the returned string matches the correct output for the os.
                switch (os) {
                    case 'win32':
                        expect(getSysConfRootData).to.satisfy(
                            (theOS) => theOS === process.env.LANDO_INSTALL_PATH || theOS === 'C:\\Program Files\\Lando');
                        break;
                    case 'darwin':
                        expect(getSysConfRootData).to.equal('/Applications/Lando.app/Contents/MacOS');
                        break;
                    case 'linux':
                        expect(getSysConfRootData).to.equal('/usr/share/lando');
                        break;
                    default:
                        // Fail if os is unknown.
                        expect.fail(os, 'unknown', 'OS supplied to getSysConfRoot from process.platform is unknown');
                }

                if (os === 'win32') {
                    // Mock extra windows stuff.
                    // @TODO: remove when decision is made on config.js line 174.
                    process.env.LOCALAPPDATA = null;
                    process.env.ProgramFiles = null;
                    process.env.ProgramW6432 = null;
                }

            });
        });

        after(function() {
            // Restoring the platform setting.
            Object.defineProperty(process, 'platform', {value: this.originalPlatform});
        });
    });

    // processType
    describe('processType', function() {
        const supportedprocessTypes = [null, 'electron', 'chrome', 'atom-shell', 'node'];

        before(function() {
            // Store the platform for restoring later.
            this.originalVersions = process.versions;
        });

        beforeEach(function() {
            // Store the platform for restoring later.
            const copyVersions = Object.assign({}, this.originalVersions);
            delete copyVersions.node;
            Object.defineProperty(process, 'versions', {
                value: copyVersions,
                writable: false
            });
        });

        supportedprocessTypes.forEach((processType) => {
            it('returns a string reflecting the process type – ' + processType, function() {

                if (processType !== null) {
                    // Add placeholder version number.
                    process.versions[processType] = '1.0.0';
                }

                const theDefaults = config.defaults();
                const processData = theDefaults.process;

                // First make sure we're receiving an object.
                expect(processData).to.be.a('string');

                // Check the returned string matches the correct output for the os.
                switch (processType) {
                    case 'electron':
                    case 'chrome':
                    case 'atom-shell':
                        expect(processData).to.equal('browser');
                        break;
                    case 'node':
                    case null:
                        expect(processData).to.equal('node');
                        break;
                    default:
                        // Fail if os is unknown.
                        expect.fail(processType, 'unknown', 'Process type supplied to processType from process.versions is unknown');
                }

            });
        });

        after(function() {
            // Restore the platform setting.
            Object.defineProperty(process, 'versions', {value: this.originalVersions});
        });
    });

    // merge
    describe('merge', function() {
        const mergeExamples = [
            // Set 1
            [
                // Example 1
                {'a': [{'b': 2}, {'d': 4}]},
                // Example 2
                {'a':[{'c':3}, {'e':5}]},
                // Answer
                {'a':[{'b':2}, {'d':4}, {'c':3}, {'e': 5}]}
            ]
        ];
        mergeExamples.forEach(function (item, key) {
            it('returns the correct object after merging – Set ' + (key + 1), function() {
                expect(config.merge(item[0], item[1])).to.deep.equal(item[2]);
            });
        });
    });

    // updatePath

    // stripEnv
    describe('stripEnv', function() {
        const envToStrip = ['npm_'];

        before(function() {
            // Store the platform for restoring later.
            this.originalEnvVars = process.env;
        });

        envToStrip.forEach(function (item) {
            it('returns the environment varibles with ' + item + ' stripped out', function() {
                process.env = config.stripEnv(item);
                let matches = 0;

                Object.keys(process.env).forEach(function (key) {
                    matches = key.indexOf(item) > -1 ? matches + 1 : matches;
                });

                expect(matches).to.equal(0);
            });
        });

        after(function() {
            // Store the platform for restoring later.
             process.env = this.originalEnvVars;
        });
    });

    // defaults

    // loadFiles

    // loadEnvs

    // This is the method we are testing

});
