#!/usr/bin/env php
<?php

/**
 * Install Backdrop through the command line.
 */
$script = basename(array_shift($_SERVER['argv']));

if (in_array('--help', $_SERVER['argv']) || empty($_SERVER['argv'])) {
  echo <<<EOF

Install Backdrop through the command line.

Examples:
./core/scripts/install.sh --db-url=mysql://root:pass@localhost:port/dbname

Arguments:
profile                                   The install profile you wish to run. Defaults to 'standard'.
key=value...                              Any additional settings you wish to pass to the profile. The key is in the form [form name].[parameter name]

Options:
--root                                    Set the working directory for the script to the specified path. Required if running this script from a directory other than the Backdrop root.
--account-mail                            UID 1 email. Defaults to admin@example.com
--account-name                            UID 1 name. Defaults to admin
--account-pass                            UID 1 pass. Defaults to a randomly generated password.
--clean-url                               Defaults to 1
--db-prefix                               An optional table prefix to use for initial install.
--db-url=<mysql://root:pass@127.0.0.1/db  A database URL. Only required for initial install - not re-install.

--locale=<en-GB>                          A short language code. Sets the default site language. Language files must already be present.
--site-mail                               From: for system mailings. Defaults to admin@example.com
--site-name                               Defaults to Backdrop

\n
EOF;
  exit;
}

// Define default server settings.
$_SERVER['HTTP_HOST']       = 'default';
$_SERVER['PHP_SELF']        = '/index.php';
$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
$_SERVER['SERVER_SOFTWARE'] = NULL;
$_SERVER['REQUEST_METHOD']  = 'GET';
$_SERVER['QUERY_STRING']    = '';
$_SERVER['PHP_SELF']        = $_SERVER['REQUEST_URI'] = '/';
$_SERVER['HTTP_USER_AGENT'] = 'console';

// Set default options.
$arguments = array();
$options = array(
  'account-mail' => 'admin@example.com',
  'account-name' => 'admin',
  'account-pass' => md5(microtime() . mt_rand()),
  'site-name' => 'Backdrop',
  'clean-url' => '1',
  'db-prefix' => '',
  'db-url' => '',
  'locale' => 'en',
  'site-mail' => 'admin@example.com',
  'site-name' => 'Backdrop',
  'root' => '',
);

// Parse provided options.
while ($param = array_shift($_SERVER['argv'])) {
  if (strpos($param, '--') === 0) {
    $param = substr($param, 2);
    if (strpos($param, '=')) {
      list($key, $value) = explode('=', $param);
      $options[$key] = $value;
    }
    else {
      $options[$param] = array_shift($_SERVER['argv']);
    }
  }
  else {
    $arguments[] = $param;
  }
}

// Set the install profile.
if (!isset($arguments[0])) {
  $arguments[0] = 'standard';
}
$profile = array_shift($arguments);

// Parse additional settings.
$additional_form_options = array();
foreach ($arguments as $argument) {
  list($key, $value) = explode('=', $argument);
  $additional_form_options[$key] = $value;
}

// Set the working directory.
if ($options['root'] && is_dir($options['root'])) {
  chdir($options['root']);
}
unset($options['root']);

// Parse the database URL.
if (empty($options['db-url'])) {
  print "--db-url option is required. Specify one as --db-url=mysql://user:pass@host_name/db_name.\n";
  exit;
}
$url = parse_url($options['db-url']);
$url += array(
  'driver' => NULL,
  'user' => NULL,
  'pass' => NULL,
  'host' => NULL,
  'port' => NULL,
  'path' => NULL,
  'database' => NULL,
);
$url = (object)array_map('urldecode', $url);
$db_spec = array(
  'driver' => 'mysql',
  'username' => $url->user,
  'password' => $url->pass,
  'port' => $url->port,
  'host' => $url->host,
  // Remove leading / character from database names.
  'database' => substr($url->path, 1),
);


$settings = array(
  'parameters' => array(
    'profile' => $profile,
    'locale' => $options['locale'],
  ),
  'forms' => array(
    'install_settings_form' => array(
      'driver' => $db_spec['driver'],
      $db_spec['driver'] => $db_spec,
      'op' => 'Save and continue',
    ),
    'install_configure_form' => array(
      'site_name' => $options['site-name'],
      'account' => array(
        'name' => $options['account-name'],
        'mail' => $options['account-mail'],
        'pass' => array(
          'pass1' => $options['account-pass'],
          'pass2' => $options['account-pass'],
        ),
      ),
      'update_status_module' => array(
        1 => TRUE,
        2 => TRUE,
      ),
      'clean_url' => $options['clean-url'],
      'op' => 'Save and continue',
    ),
  ),
);

// Merge in the additional options.
foreach ($additional_form_options as $key => $value) {
  $current = &$settings['forms'];
  foreach (explode('.', $key) as $param) {
    $current = &$current[$param];
  }
  $current = $value;
}

define('BACKDROP_ROOT', getcwd());
define('MAINTENANCE_MODE', 'install');

require_once './core/includes/install.core.inc';
try {
  print "Installing Backdrop. This may take a moment...\n";
  install_backdrop($settings);
  config_set('system.core', 'site_mail', $options['site-mail']);
  print "Backdrop installed successfully.\n";
  exit(0);
}
catch (Exception $e) {
  print "An error occurred. Output of installation attempt is as follows:\n";
  print $e->getMessage() . "\n";
  exit(1);
}
