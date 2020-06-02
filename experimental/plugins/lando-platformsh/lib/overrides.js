'use strict';

const overrides = {};

// DRUPAL 8
overrides['d8config:system.file:path:temporary'] = '/tmp';
overrides['d8settings:skip_permissions_hardening'] = 1;

module.exports = overrides;
