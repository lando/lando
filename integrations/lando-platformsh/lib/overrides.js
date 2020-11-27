'use strict';

const overrides = {};

// DRUPAL 8
overrides['d8settings:file_temp_path'] = '/tmp';
overrides['d8settings:skip_permissions_hardening'] = 1;

module.exports = overrides;
