<?php

/**
 * @file
 * Fake an HTTPS request, for use during testing.
 */

// Set a global variable to indicate a mock HTTPS request.
$is_https_mock = empty($_SERVER['HTTPS']);

/**
 * Defines the root directory of the Backdrop installation.
 *
 * The dirname() function is used to get path to Backdrop root folder, which
 * avoids resolving of symlinks. This allows the code repository to be a symlink
 * and hosted outside of the web root. See issue #1297 and #1862.
 */
define('BACKDROP_ROOT', dirname(dirname(dirname(dirname(dirname($_SERVER['SCRIPT_FILENAME']))))));

// Change to HTTPS.
$_SERVER['HTTPS'] = 'on';
foreach ($_SERVER as $key => $value) {
  $_SERVER[$key] = str_replace('core/modules/simpletest/tests/https.php', 'index.php', $value);
  $_SERVER[$key] = str_replace('http://', 'https://', $_SERVER[$key]);
}

// Change current directory to the Backdrop root.
chdir(BACKDROP_ROOT);

require_once BACKDROP_ROOT . '/core/includes/bootstrap.inc';

// Make sure this file can only be used by simpletest.
backdrop_bootstrap(BACKDROP_BOOTSTRAP_CONFIGURATION);
if (!backdrop_valid_test_ua()) {
  header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden');
  exit;
}

backdrop_bootstrap(BACKDROP_BOOTSTRAP_FULL);
menu_execute_active_handler();
