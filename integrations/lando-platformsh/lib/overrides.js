'use strict';

const overrides = {};

// DRUPAL 8
overrides['d8config:system.file:path:temporary'] = '/tmp';
overrides['d8settings:skip_permissions_hardening'] = 1;

// XDEBUG 2
overrides['php:xdebug.remote_enable'] = 1;
overrides['php:xdebug.remote_mode'] = 'req';
overrides['php:xdebug.remote_port'] = 9000;
overrides['php:xdebug.remote_connect_back'] = 0;

// XDEBUG 3
overrides['php:xdebug.discover_client_host'] = 1;
overrides['php:xdebug.mode'] = 'debug';

module.exports = overrides;
