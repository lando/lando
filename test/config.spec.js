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
            it('returns the sysConfRoot based on path for os ' + os, function() {
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
                        expect(false).to.equal(true);
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

    // merge

    // updatePath

    // stripEnv

    // defaults

    // loadFiles

    // loadEnvs

    // This is the method we are testing
    
});
