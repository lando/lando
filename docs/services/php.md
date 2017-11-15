php
===

[PHP](http://php.net/) is a popular scripting language that is especially suited for web development. It is often served by either [apache](./apache.md) or [nginx](./nginx.md)

You can also use the [Hip Hop Virtual Machine](http://hhvm.com/) by specifying `hhvm` as the version. This will currently run `hvvm:3.20`. In the future we will support more version of `hhvm`. Note that if you specify `hhvm` it will force usage of `nginx`.

You can easily add `php` or `hhvm` to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported Versions
------------------

*   [7.1](https://hub.docker.com/r/devwithlando/php)
*   [7.0](https://hub.docker.com/r/devwithlando/php)
*   [5.6](https://hub.docker.com/r/devwithlando/php)
*   [5.5](https://hub.docker.com/r/devwithlando/php)
*   [5.4](https://hub.docker.com/r/devwithlando/php)
*   [5.3](https://hub.docker.com/r/devwithlando/php)
*   [hhvm](https://hub.docker.com/r/baptistedonaux/hhvm)
*   [latest](https://hub.docker.com/r/devwithlando/php)
*   custom

Installed Extensions
--------------------

* apc (in php 5.3 and 5.4)
* bcmath
* bz2
* calendar
* Core
* ctype
* curl
* date
* dom
* exif
* fileinfo
* filter
* ftp
* gd
* hash
* iconv
* imagick
* imap
* json
* ldap
* libxml
* mbstring
* mcrypt
* memcached
* mysqli
* mysqlnd
* OAuth
* openssl
* pcre
* PDO
* pdo_mysql
* pdo_pgsql
* pdo_sqlite
* Phar
* posix
* readline
* redis
* Reflection
* session
* SimpleXML
* soap
* SPL
* sqlite3
* standard
* tokenizer
* xdebug
* xml
* xmlreader
* xmlwriter
* Zend OPcache (in php 5.5+)
* zip
* zlib

Installing Your Own Extensions
------------------------------

You can install your own extensions using the [`extras`](./../config/services.md#build-extras) build step. Here is an example that installs the `memcached` extensions. Note that you will likely need to restart your app after this step for the extension to load correctly!

```bash
services:
  appserver:
    extras:
      - "apt-get update"
      - "apt-get install libmemcached-dev -y"
      - "pecl install memcached"
      - "docker-php-ext-enable memcached"
```

LAMP Example
------------

{% codesnippet "./../examples/lamp/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/lamp).

LEMP Example
------------

{% codesnippet "./../examples/lemp/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/lemp).

CLI Example
------------

{% codesnippet "./../examples/phpcli/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/phpcli).

Using Xdebug
------------

You can activate `xdebug` for remote debugging by setting `xdebug: true` in the config for your `php` service. This will enable `xdebug` and configure it so you can connect from your host machine. You will need to configure your IDE so that it can connect. Here is some example config for [ATOM's](https://atom.io/) [`php-debug`](https://github.com/gwomacks/php-debug) plugin:

```
"php-debug":
  {
    ServerPort: 9000
    PathMaps: [
      "/app/www;/Users/pirog/Desktop/work/lando/examples/lando/www"
    ]
  }
```

The first part of a pathmap will be the location of your code in the container. Generally, this should be `/app`. Also note that if your app is in a nested docroot, you will need to append that to the paths. The example above uses an app with a nested webroot called `www`.

> #### Info::Problems starting XDEBUG
>
> If you are visting your site and xdebug is not triggering, it might be worth appending `?XDEBUG_START_SESSION=LANDO` to your request and seeing if that does the trick.

### Troubleshooting

If you have set `xdebug: true` in your recipe or service config and run `lando restart` but are still having issues getting `xdebug` to work correctly we recommend that you remove `xdebug: true`, run `lando restart` and then set the relevant `xdebug` config directly using a custom a `php.ini` (see examples above on how to set a custom config file). Your config file should minimally include something like below.

```yaml
xdebug.max_nesting_level = 256
xdebug.show_exception_trace = 0
xdebug.collect_params = 0
xdebug.remote_enable = 1
xdebug.remote_host = YOUR HOST IP ADDRESS
```

You can use `lando info --deep | grep IPAddress` to help discover the correct host ip address but please note that this can change and will likely differ from dev to dev.
