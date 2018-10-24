/**
 * Lando blackfire service builder
 *
 * @name blackfire
 */

'use strict';

module.exports = lando => {

  /**
   * Supported versions for blackfire
   */
  const versions = [
    '1.15.0',
    'latest',
    'custom'
  ];

  /**
   * Return the networks needed
   */
  const networks = () => ({});

  /**
   * Build out blackfire
   */
  const services = (name, config) => {

    // Start a services collector
    const services = {};

    // Default blackfire service
    services[name] = {
      image: 'blackfire/blackfire:' + config.version,
      command: 'blackfire-agent',
      networks: {default: {aliases: ['blackfire']}}
    };


    // Return our service
    return services;
  };

  /**
   * Return the volumes needed
   */
  const volumes = () => ({});

  /**
   * Metadata about our service
   */
  const info = (name, config) => ({});

  return {
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
