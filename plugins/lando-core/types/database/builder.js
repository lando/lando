'use strict';

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_database',
  parent: '_lando',
  builder: parent => class LandoDatabase extends parent {
    constructor(id, options = {}, ...sources) {
      // @TODO portforwarding?
      super(id, options, ...sources);
    };
  },
};

/*

  const info = (name, config) => {
    // Add in generic info
    const info = {
      creds: {
        user: config.environment.MYSQL_USER,
        password: config.environment.MYSQL_PASSWORD,
        database: config.environment.MYSQL_DATABASE,
      },
      internal_connection: {
        host: name,
        port: config.port || 3306,
      },
      external_connection: {
        host: 'localhost',
        port: config.portforward || 'not forwarded',
      },
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config = config.config;
    }

    // Return the collected info
    return info;
  };
*/
