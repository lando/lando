PHP
===

[PHP](http://php.net/) is a popular scripting language that is especially suited for web development. It is often served by either [apache](./apache.md) or [nginx](./nginx.md)

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.yml).

<!-- toc -->

Supported versions
------------------

*   **[7.2](https://hub.docker.com/r/devwithlando/php)** **(default)**
*   [7.1](https://hub.docker.com/r/devwithlando/php)
*   [7.0](https://hub.docker.com/r/devwithlando/php)
*   [5.6](https://hub.docker.com/r/devwithlando/php)
*   [custom](./../config/services.md#advanced)

Legacy versions
---------------

> #### Warning::Using Unsupported PHP Versions
>
> While you can currently use some [EOL php version](http://php.net/supported-versions.php) with Lando it's worth noting that we also do not support such versions so your mileage may vary. If you are having issues with unsupported versions and open a ticket about it, the most likely response you will get is "upgrade to a supported version".

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated eg YMMV and do not expect a ton of support if you have an issue.

*   [5.5](https://hub.docker.com/r/devwithlando/php)
*   [5.4](https://hub.docker.com/r/devwithlando/php)
*   [5.3](https://hub.docker.com/r/devwithlando/php)

Patch versions
--------------

Because we use our own custom images for `php` specifying a patch version is not currently supported.

If you **really** need to lock down to a patch vesrion you could consider using either a [custom compose service](./compose.md) or a service [overrides](./../config/services.md#overrides).

Configuration
-------------

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  my-service:
    type: php:7.2
    via: apache:2.4
    ssl: false
    webroot: .
    xdebug: false
    composer: []
    config:
      vhosts: SEE BELOW
      php: SEE BELOW
```

### Choosing a server, or no server

By default `php` services will be served by the default version of our [apache](./apache.md) service but you can switch this to either `nginx` or `cli`.

Like with `apache`, `nginx` will use the the default version of our [nginx](./nginx.md) service while `cli` will just spin up a `php` container without a webserver. The latter is useful if you just want to work on a CLI utility or lock down what version `composer` runs with.

** With Apache (default) **

```yaml
services:
  my-service:
    type: php
    via: apache
```

** With nginx **

```yaml
services:
  my-service:
    type: php
    via: nginx
```

** As CLI **

```yaml
services:
  my-service:
    type: php
    via: cli
```

### Toggling xdebug

You can enable the `xdebug` extension by setting `xdebug: true`. Lando will also automatically configure `xdebug.remote_enable` and `xdebug.remote_host` for you. This means that `xdebug` should be *ready to receive connections* out of the box.

Note that unlike in previous versions of Lando `xdebug: false` will now disable the `xdebug` extension instead of just disabling `xdebug.remote_enable`

#### Setting up your IDE for XDEBUG

While Lando will handle the server side configuration for you, there is often a considerable amount of pain lurking in the client side configuration. To that end here is some helpful info about a few popular clients.

**ATOM**

Here is some example config for [ATOM's](https://atom.io/) [`php-debug`](https://github.com/gwomacks/php-debug) plugin:

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

**VSCODE**

[Setup XDebug in Visual Studio Code Guide](./guides/lando-with-vscode.md)

#### Troubleshooting Xdebug

> #### Info::Problems starting XDEBUG
>
> If you are visiting your site and xdebug is not triggering, it might be worth appending `?XDEBUG_START_SESSION=LANDO` to your request and seeing if that does the trick.

If you have set `xdebug: true` in your recipe or service config and run `lando rebuild` but are still having issues getting `xdebug` to work correctly we recommend that you remove `xdebug: true`, run `lando rebuild` and then set the relevant `xdebug` config directly using a custom a `php.ini` (see examples above on how to set a custom config file). Your config file should minimally include something like below.

```yaml
xdebug.max_nesting_level = 256
xdebug.show_exception_trace = 0
xdebug.collect_params = 0
xdebug.remote_enable = 1
xdebug.remote_host = YOUR HOST IP ADDRESS
```

You can use `lando info --deep | grep IPAddress` to help discover the correct host ip address but please note that this can change and will likely differ from dev to dev.

### Installing global dependencies

You can also use the `composer` key if you need to require any [global composer dependenices](https://getcomposer.org/doc/03-cli.md#require). This follows the same syntax as your normal [`composer.json`](https://getcomposer.org/doc/01-basic-usage.md#composer-json-project-setup) except written as YAML instead of JSON.

> #### Info::Use composer.json if you can
>
> While there are some legitimate use cases to globally install a composer dependency it is almost always preferred to install using your applications normal `composer.json` and then running either `lando composer install` or alternatively setting up a [build step](./../config/services.md#build-steps) that will automatically run before your app starts up.

Here is an example of globally installing `phpunit/phpunit` `^6.5`

```yaml
services:
  my-service:
    type: php
    composer:
      phpunit/phpunit: ^6.5
```

Here is an example of using a [build step](./../config/services.md#build-steps) to automatically `composer install` your dependencies before your app starts.

```yaml
services:
  my-service:
    type: php
    build:
      - composer install
```

### Using custom config files

You may need to override our [default php config](https://github.com/lando/lando/tree/master/plugins/lando-services/services/php) with your own.

If you do this you must use files that exists inside your applicaton and express them relative to your project root as below.

Note that the default files may change based on how you set both `ssl` and `via`. Also note that the `vhosts` config will be either for `apache` or `nginx` depending on how you set `via`. We *highly recommend* you check out both the [apache](./apache.md#configuration) and [nginx](./nginx.md#configuration) if you plan to use a custom `vhosts`

If you set `via: cli` then, as you might suspect, `vhosts` is not going to do anything.

**A hypothetical project**

```bash
./
|-- config
   |-- default.conf
   |-- php.ini
|-- index.php
|-- .lando.yml
```

**Landofile using custom php config**

```yaml
services:
  my-service:
    type: php
    config:
      php: config/php.ini
      vhosts: config/default.conf
```

Path Considerations
-------------------

Lando will set the following `PATH` hierarchy for this service.

```js
[
  # The line below should be where your app's composer.json binaries live
  '/app/vendor/bin',
  '/usr/local/sbin',
  '/usr/local/bin',
  '/usr/sbin',
  '/usr/bin',
  '/sbin',
  '/bin',
  # The line below should be where global composer binaries live
  '/var/www/.composer/vendor/bin',
]
```

This is useful to note if you are not using absolute paths in any [tooling routes](./../config/tooling.md) and are getting the unexpected version of a particular utility.


Installed Extensions
--------------------

|           | 5.3 | 5.4 | 5.5 | 5.6 | 7.0 | 7.1 | 7.2 |
| --        | --- | --- | --- | --- | --- | --- | --- |
| apc       |  X  |  X  |     |     |     |     |     |
| apcu      |     |     |  X  |  X  |  X  |  X  |  X  |
| bcmath    |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| bz2       |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| calendar  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| Core      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| ctype     |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| curl      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| date      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| dom       |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| exif      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| fileinfo  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| filter    |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| ftp       |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| gd        |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| gettext   |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| hash      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| iconv     |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| imagick   |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| imap      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| intl      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| json      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| ldap      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| libxml    |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| mbstring  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| mcrypt    |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| memcached |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| mysqli    |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| mysqlnd   |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| OAuth     |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| OPcache   |     |     |  X  |  X  |  X  |  X  |  X  |
| openssl   |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| pcntl     |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| pcre      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| PDO       |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| pdo_mysql |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| pdo_pgsql |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| pdo_sqlite|  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| Phar      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| posix     |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| readline  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| redis     |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| readline  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| Reflection|  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| session   |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| SimpleXML |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| soap      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| SPL       |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| sqlite3   |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| standard  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| tokenizer |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| xdebug    |     |     |     |     |     |     |     |
| xml       |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| xmlreader |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| xmlwriter |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| zip       |  X  |  X  |  X  |  X  |  X  |  X  |  X  |
| zlib      |  X  |  X  |  X  |  X  |  X  |  X  |  X  |

Note that `xdebug` is off by default but you can enable it on by setting your `php` services config to `xdebug: true`. Read more about this in "Configuration" above.

### Adding or removing extensions

There are a few ways you can extend or modify our php images:

* Using [build steps](./../config/services.md#build-steps)
* Using your own image with [service overrides](./../config/services.md#overrides)
* Building from your own local Dockerfile [service overrides](./../config/services.md#using-dockerfiles)

Consider the following example that uses [build steps](./../config/services.md#build-steps) to install the `memcached` php extension.

```yaml
services:
  my-service:
    type: php
    build_as_root:
      - apt-get update -y
      - apt-get install libmemcached-dev -y
      - pecl install memcached
      - docker-php-ext-enable memcached
```

Note the usage of `docker-php-ext-enable`. Our images extend the [official Docker php images](https://hub.docker.com/r/library/php) which ship with a bunch of [helpful utility scripts](https://github.com/docker-library/php) to manage php extensions.

Example
-------

If you are interested in a working example of this service that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/php](https://github.com/lando/lando/tree/master/examples/php)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
