/**
* Rails recipe
*
* @name Rails
*/

'use strict';

const Recipe = require('../../../lib/Recipe');

/**
 * [Rails description]
 * @extends Recipe
 */
class Rails extends Recipe {

  /**
   * @inheritdoc
   */
  build(name, config) {
    // Figure out some tooling needs
    this.needs = ['database'];
    // this.injectCache(config);
    return super.build(name, config);
  }

  /**
   * @inheritdoc
   */
  services(config) {
    let _ = this.lando.node._;
    // Rails Specific Services
    this.serviceData = {
      appserver: {
        type: 'ruby:' + this._.get(config, 'ruby', '2.4') + '-rails',
        ssl: this._.get(config, 'ssl', true),
        command: [
          'bundle exec puma -C /user/.lando/services/config/rails/puma/puma.rb'
        ]
      },
      database: {
        type: _.get(config, 'database', 'postgres'),
        portforward: true,
        creds: {
          user: config._recipe,
          password: config._recipe,
          database: config._recipe
        }
      }
    };
    return super.services(config);
  }

  /**
   * @inheritdoc
   */
  tooling(config) {
    this.toolingData = {
      bundle: {
        service: 'appserver_cli',
        description: 'Run bundler commands'
      },
      irb: {
        service: 'appserver_cli',
        description: 'run the interactive ruby shell'
      },
      ruby: {
        service: 'appserver_cli',
        description: 'Run ruby commands'
      },
      rails: {
        service: 'appserver_cli',
        description: 'Run rails commands',
        cmd: ['bundle', 'exec', 'rails']
      },
      rake: {
        service: 'appserver_cli',
        description: 'Run rake commands',
        cmd: ['bundle', 'exec', 'rake']
      },
      gem: {
        service: 'appserver_cli',
        description: ''
      }
    };
    return super.tooling(config);
  }
}

module.exports = Rails;
