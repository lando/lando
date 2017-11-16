Services
========

Services are the "atomic unit" of Lando. They are self-contained Docker containers that can be easily customized in the `.lando.yml` file and when combined together with other services, tooling and proxy config they can form [recipes](./recipes.md).

On a more technical level a service will do the following:

*   Specify service configuration for the `.lando.yml` file
*   Transform config from `.lando.yml` into a version 3 Docker compose object
*   Augment `lando info` for that service

Loading Services
----------------

You can load a service from any plugin with the `post-bootstrap` event. See [this](https://github.com/lando/lando/blob/master/plugins/lando-services/lib/bootstrap.js#L26) for how we load services from our core plugins.

```js
// Add particular services to lando
lando.events.on('post-bootstrap', function(lando) {

  // Loads a service called myservice from a ./myservice.js
  lando.services.add('myservice', require('./myservice')(lando));

});
```

Writing Services
----------------

A services module (eg the file loaded with `lando.services.add`) needs to be made up of six exportable properties:

*   `versions` - An array of supported versions for your service.
*   `networks` - A function that returns the docker compose [networks](https://docs.docker.com/compose/compose-file/#network-configuration-reference) needed for your service.
*   `services` - A function that returns the docker compose [services](https://docs.docker.com/compose/compose-file/#service-configuration-reference)
*   `volumes` - A function that returns the docker compose [volumes](https://docs.docker.com/compose/compose-file/#volume-configuration-reference)
*   `info` - A function that augments the info object to add additional metadata about your service.
*   `configDir` - A path to a directory with any config files your service might require.

A trivial `service` that is syntaxically correct but doesn't do anything would take this form:

```js
/**
 * Trivial service
 *
 * @name myservice
 */

'use strict';

module.exports = function(lando) {

  /**
   * Supported versions for myservice
   */
  var versions = [];

  /**
   * Return the networks needed
   */
  var networks = function(name, config) {
    return {};
  };

  /**
   * Return the services needed
   */
  var services = function(name, config) {
    return {};
  };

  /**
   * Return the volumes needed
   */
  var volumes = function(name, config) {
    return {};
  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {
    return {};
  };

  return {
    configDir: __dirname,
    versions: versions,
    networks: networks,
    services: services,
    volumes: volumes,
    info: info
  };

};
```

### versions

The versions array is a list of the docker tags for the docker image you've chosen to use as the basis of your service. It is a common convention to add in two special tags `latest` and `custom`.  `latest` will need to be a valid docker tag (it usually exists by default). `custom` will tell Lando that the image is provided downstream in the [advanced service configuration](./../config/overrides.md).

```js
/**
 * Supported versions for apache
 */
var versions = [
  '2.4',
  '2.2',
  'latest',
  'custom'
];
```

### networks

Networks is a function that should return an object of [docker compose networks](https://docs.docker.com/compose/compose-file/#network-configuration-reference). In almost all cases you can return an empty object.

```js
/**
 * Return the networks needed
 */
var networks = function(name, config) {
  return {};
};
```

### services

Services is a function that returns an object of [docker composer services](https://docs.docker.com/compose/compose-file/#service-configuration-reference). Generally this is the most important part of the service module. It allows Lando to build a custom docker compose service definition based on the values specified in `config` which is taken from the user's `.lando.yml`.

```js
/**
 * Build out apache
 */
var services = function(name, config) {

  // Start a services collector
  var services = {};

  // Define config mappings
  var configFiles = {
    server: '/usr/local/apache2/conf/httpd.conf',
    webroot: config._mount
  };

  // Add the webroot if its there
  if (_.has(config, 'webroot')) {
    configFiles.webroot = configFiles.webroot + '/' + config.webroot;
  }

  // Default apache service
  var apache = {
    image: 'httpd:' + config.version,
    ports: ['80'],
    environment: {
      TERM: 'xterm',
      LANDO_WEBROOT: configFiles.webroot
    },
    volumes: [],
    command: 'httpd-foreground'
  };

  // Set the default HTTPD conf file
  var httpConf = ['apache', 'httpd.conf'];
  var confVol = buildVolume(httpConf, configFiles.server, defaultConfDir);
  apache.volumes = addConfig(confVol, apache.volumes);

  // Handle ssl option
  if (config.ssl) {

    // Add the SSL port
    apache.ports.push('443');

    // If we don't have a custom default ssl config lets use the default one
    var sslConf = ['apache', 'httpd-ssl.conf'];
    var sslVolume = buildVolume(sslConf, configFiles.server, defaultConfDir);
    apache.volumes = addConfig(sslVolume, apache.volumes);

    // Add in an add cert task
    apache.volumes = addScript('add-cert.sh', apache.volumes);

  }

  // Handle custom config files
  _.forEach(configFiles, function(file, type) {
    if (_.has(config, 'config.' + type)) {
      var local = config.config[type];
      var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
      apache.volumes = addConfig(customConfig, apache.volumes);
    }
  });

  // Put it all together
  services[name] = apache;

  // Return our service
  return services;

};
```

### volumes

Volumes is a function that returns an object of [docker compose volumes](https://docs.docker.com/compose/compose-file/#volume-configuration-reference). Generally this can return an empty object unless you want to share volumes between services.

This example defines a `data` and `appserver` (the value of the `name` variable) volume that can be shared by other services.

```js
/**
 * Return the volumes needed
 */
var volumes = function(name, config) {

  // Construct our volumes
  var volumes = {
    data: {}
  };

  // Add the appserver
  volumes[name] = {};

  // Return the volumes
  return volumes;

};
```

### info

Info is a function that returns an object of additional metadata about your service. This is a great way to augment the info that is delivered via `lando info`.

```js
/**
 * Metadata about our service
 */
var info = function(name, config) {

  // Start up an info collector
  var info = {};

  // Add in appserver basics
  info.via = config.via;
  info.webroot = _.get(config, 'webroot', '.');

  // Show the config files being used if they are custom
  if (!_.isEmpty(config.config)) {
    info.config  = config.config;
  }

  // Return the collected info
  return info;

};
```

### configDir

ConfigDir is the `path` to any relevant config files for your service such as `php.ini` or `default.vcl`. Generally this will be the same directory as your service module.

```js
configDir: __dirname
```

Tips and Tricks
---------------

Here are some helpful tips and tricks to get you building your own service.

### Choosing a base image

While you can (and its sometimes necessary to) roll your own base image it's usually easier to build your Lando service on top of a preexisting image with wide community adoption and/or easy configuration options.

For many services you can use either the [official docker version](https://hub.docker.com/explore/) or the image provided by the team for the service itself like [this image](https://hub.docker.com/r/mailhog/mailhog/) for `mailhog`. If neither of these images exist or are desirable you can search the [docker hub](https://hub.docker.com/) for community provided images or build your own image. Also note that since you can dynamically build a compose definition based on user config you can mix in multiple images like we do in our [`solr`](https://github.com/lando/lando/blob/master/plugins/lando-services/solr/solr.js#L47) service.

Generally, you will want to choose images based on this order of things:

1.  Official Docker image
2.  Official image provided by service's dev team
3.  Widely adopted image from Docker Hub
4.  Custom image created for Lando

It is advantageous to use images that are fundamentally `debian` in flavor since this will ensure the greatest compatibility between the image and Lando. If you choose a different flavor such as `alpine` you will likely need to set `LANDO_NO_SCRIPTS=true` in the `environment` section of your service.

It is also worth noting that official docker images can sometimes be extremely barebones. While this is by design it is sometimes not enough to meet requirements for specific use cases eg you can't run Drupal on the official docker php image. In these cases it's usually worth finding a community image or building your own image that uses hte official docker image as the base image.

### Determining config options

Determining how config set in `.lando.yml` influences the construction of a given service is often the most difficult task when creating a service. It's always a good idea to check out the `README` for the base image you have chosen to get a good idea of what things are immediately and easily configurable. For example, this [varnish] image provides a lot of nice options.


### providing examples/docs
