<?php
$conf['acquia_hosting_site_info']['db']['name'] = getenv('AH_SITE_GROUP');
$databases['default']['default'] = [
  'database' => 'acquia',
  'username' => 'acquia',
  'password' => 'acquia',
  'host' => 'database',
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
];

$settings['hash_salt'] = md5(getenv('LANDO_HOST_IP'));
$settings['memcache']['servers'] = ['memcached:11211' => 'default'];
$settings['memcache']['bins'] = ['default' => 'default'];
$settings['memcache']['key_prefix'] = '';
