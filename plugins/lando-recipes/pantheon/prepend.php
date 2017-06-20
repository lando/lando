<?php

// Chef-populated constants
define('PANTHEON_INFRASTRUCTURE_ENVIRONMENT', 'live');
define('PANTHEON_SITE', '7587b3ea-95b6-44ab-b36b-6ebd9c3e9866');
define('PANTHEON_ENVIRONMENT', 'dev');
define('PANTHEON_BINDING', '2d189dc9dcfe45dfa16498979f99665c');
define('PANTHEON_BINDING_UID_NUMBER', '18010');

define('PANTHEON_DATABASE_HOST', '10.223.144.239');
define('PANTHEON_DATABASE_PORT', '24531');
define('PANTHEON_DATABASE_USERNAME', '');
define('PANTHEON_DATABASE_PASSWORD', '');
define('PANTHEON_DATABASE_DATABASE', '');
define('PANTHEON_DATABASE_BINDING', '081673010c994c1bb6fbf3812eff883f');

define('PANTHEON_REDIS_HOST', '10.223.192.17');
define('PANTHEON_REDIS_PORT', '13827');
define('PANTHEON_REDIS_PASSWORD', '3d4b82d98bd1408e80f7d05011ff2199');
define('PANTHEON_VALHALLA_HOST', 'valhalla4.cluster.panth.io');

# WordPress Specifc Constants
if (isset($_SERVER['SERVER_PORT'])) {
	define('JETPACK_SIGNATURE__HTTP_PORT', $_SERVER['SERVER_PORT']);
	define('JETPACK_SIGNATURE__HTTPS_PORT', $_SERVER['SERVER_PORT']);
}


// System paths
putenv('PATH=/usr/local/bin:/bin:/usr/bin:/srv/bin');

// Legacy Drupal Settings Block
$_SERVER['PRESSFLOW_SETTINGS'] = '{"conf":{"pressflow_smart_start":true,"pantheon_binding":"2d189dc9dcfe45dfa16498979f99665c","pantheon_site_uuid":"7587b3ea-95b6-44ab-b36b-6ebd9c3e9866","pantheon_environment":"dev","pantheon_tier":"live","pantheon_index_host":"cca09a69-daec-4c72-8f1c-3efee0d3e8d8-private.panth.io","pantheon_index_port":449,"redis_client_host":"10.223.192.17","redis_client_port":13827,"redis_client_password":"3d4b82d98bd1408e80f7d05011ff2199","file_public_path":"sites/default/files","file_private_path":"sites/default/files/private","file_directory_path":"sites/default/files","file_temporary_path":"/srv/bindings/2d189dc9dcfe45dfa16498979f99665c/tmp","file_directory_temp":"/srv/bindings/2d189dc9dcfe45dfa16498979f99665c/tmp","css_gzip_compression":false,"js_gzip_compression":false,"page_compression":false},"databases":{"default":{"default":{"host":"10.223.144.239","port":24531,"username":"pantheon","password":"9a20c969b7ac4b1299178ac27a310699","database":"pantheon","driver":"mysql"}}},"drupal_hash_salt":"c614f1956ea29e90a6d5564616123b8b9f1f8430db31b69ea2e87a3c89dd7316","config_directory_name":"config"}';

// Modern Dotenv.php settings loading
include_once('/srv/includes/Dotenv.php');
Dotenv::load('/srv/bindings/'. PANTHEON_BINDING);

/**
 * These $_SERVER variables are often used for redirects in code that is read
 * directly (e.g. settings.php) so we can't have them visible to the CLI lest
 * CLI processes might hit a redirect (e.g. header() and exit()) and die.
 *
 * CLI tools are encouraged to use getenv() or $_ENV going forward to read
 * environment configuration.
 */
if (isset($_SERVER['GATEWAY_INTERFACE'])) {
  $_SERVER['PANTHEON_ENVIRONMENT'] = 'dev';
  $_SERVER['PANTHEON_SITE'] = '7587b3ea-95b6-44ab-b36b-6ebd9c3e9866';
}
else {
  unset($_SERVER['PANTHEON_ENVIRONMENT']);
  unset($_SERVER['PANTHEON_SITE']);
}

require '/srv/includes/pantheon.php';
initialize_pantheon();
