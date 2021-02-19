<?php
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
