'use strict';

const path = require('path');
const helperPath = path.resolve('test', 'helpers', 'functional', 'cli.js');
const helper = require(helperPath);
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);

// Basic PHP app.
const app = {
    'name': 'lando-php-test',
    'services': {
        'php': {
            'type': 'php:7.1'
        }
    },
    // We need this because we don't automatically expose Composer without
    // recipes.
    'tooling': {
        'composer': {
            'service': 'php'
        }
    }
};

describe('php', () => {
    it('installs prestissimo via Composer', function () {
        this.timeout(50000);
        // Create a temporary app.
        return helper.createTestApp(app).then(function (appFolder) {
            // Start the app
            return helper.execCommand(['start'], {cwd: appFolder}).then(function (res) {
                // Check what global Composer packages are installed
                return helper.execCommand(['composer', 'global', 'show'], {cwd: appFolder}).then(res => res.stdout);
            });
        })
            .should.eventually.have.string('hirak/prestissimo');
    });

    it('should have Blackfire extension loaded', function () {
        this.timeout(50000);
        return helper.createTestApp(app)
            .then(appFolder => helper.execCommand(['start'], {cwd: appFolder})
                .then(res => helper.execCommand(['ssh', 'php', '-c', 'php -m'], {cwd: appFolder})
                    .then(res => res.stdout)
                )
            ).should.eventually.have.string('blackfire');
    });
});
