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
    'name': 'lando-blackfire-test',
    'services': {
        'blackfire': {
            'type': 'blackfire:latest'
        }
    }
};

describe('blackfire', () => {
    it('runs blackfire agent', function() {
        this.timeout(50000);
        return helper.createTestApp(app)
                .then(appFolder => helper.execCommand(['start'], {cwd: appFolder})
                        .then(res => helper.execCommand(['ssh', 'blackfire', '-c', 'ps aux', '-u', 'root'], {cwd: appFolder})
                                .then(res => res.stdout)
                        )
                ).should.eventually.have.string('blackfire-agent');

    });
});
