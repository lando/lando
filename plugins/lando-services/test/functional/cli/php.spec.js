'use strict';

const path = require('path');
const helperPath = path.resolve('test', 'helpers', 'functional', 'cli.js');
const helper = require(helperPath);
const chai = require('chai');
chai.should();

describe('php', () => {
  it('installs prestissimo via Composer', function() {
    this.timeout(50000);
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

    // Create a temporary app.
    return helper.createTestApp(app)

    .then(appFolder => {
      // Start the app
      helper.execCommand(['start'], {cwd: appFolder})

      .then(res => {
        // Check what global Composer packages are installed
        helper.execCommand(['composer', 'global', 'show'], {cwd: appFolder})

        // Hopefull Prestissimo is one of them!
        .then(res => res.stdout.should.have.string('hirak/prestissimo'));
      });
    });
  });
});
