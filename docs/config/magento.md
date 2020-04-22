---
description: Magento LEMP stack on Lando for local development; powered by Docker and Docker Compose, learn how to config php and nginx version, use postgres or mysql or mariadb, composer, xdebug and custom config files, oh and also import and exports databases.
---

# Magento

Magento 2, a cutting-edge, feature-rich eCommerce solution that gets results.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [Magento](https://magento.com/products/magento-commerce) apps.

[[toc]]

## Getting Started

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familar with [its basics](./../basics/)
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM) here is an example of using the LEMP recipe to run the older [CakePHP 2.0](https://cakephp.org/) project. Note that CakePHP could be any other [php framework](https://www.dotcominfoway.com/blog/top-5-must-have-php-frameworks-2018) or your own custom php thing.

```bash
# Initialize a Magento recipe
lando init \
  --source cwd \
  --recipe magento \
  --webroot pub \
  --name my-first-magento-app

# Start it up
lando start

# If project is empty, install Magento Community Edition
lando magento:create-project:community

# Or, Install Magento Enterprise Edition
lando magento:create-project:enterprise

# List information about this app.
lando info
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe. If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: magento
config:
  php: '7.3'
  via: nginx
  webroot: pub
  database: mariadb:10.2
  xdebug: false
  config:
    server: SEE BELOW
    php: SEE BELOW
    database: SEE BELOW
    vhosts: SEE BELOW
```

Note that if the above config options are not enough all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a php version

You can set `php` to any version that is available in our [php service](./php.md). However, you should make sure that whatever framework or custom code you write is designed to work with your choice.

Here is the [recipe config](./../config/recipes.md#config) to set the Magento recipe to use `php` version `7.1`

```yaml
recipe: magento
config:
  php: '7.1'
```

### Webserver

This Magento recipe only supports NGINX. Apache support may become available in future releases.

### Choosing a database backend

By default this recipe will use the latest Magento-supported version of [mariadb](./mariadb.md) service as the database backend but you can also switch this to use [`mysql`](./mysql.md). Note that you can also specify a version *as long as it is a version available for use with lando* for either `mysql`, `mariadb`.

If you are unsure about how to configure the `database` we *highly recommend* you check out the [mysql](./mysql.md), [mariadb](./mariadb.md)and ['postgres'](./postgres.md) services before you change the default.

You should consult the [Magento requirements](https://devdocs.magento.com/guides/v2.3/install-gde/system-requirements-tech.html) to ensure that the Lando configuration you've chosen is compatible with your version of Magento.

#### Using MariaDB (default)

```yaml
recipe: magento
config:
  database: mariadb:10.2
```

#### Using MySQL

```yaml
recipe: magento
config:
  database: mysql:5.7
```

### Choosing a caching and session backend

By default, this recipe will spin up a Redis cache and session service at the Magento-recommended version of 5.0

However, you can disable or [override the service version](../config/services.md#overrides) as needed.

#### Disabling Redis

```yaml
recipe: magento
config:
  cache: false
  session: false
```

This recipe comes with a helpful command to auto-configure Redis sessions and cache services for Magento.

#### Auto-Configure Redis for Magento

```bash
lanado magento:env:apply
```

### Using xdebug

This is just a passthrough option to the [xdebug setting](./php.md#toggling-xdebug) that exists on all our [php services](./php.md). The `tl;dr` is `xdebug: true` enables and configures the php xdebug extension and `xdebug: false` disables it.

```yaml
recipe: magento
config:
  xdebug: true|false
```

However, for more information we recommend you consult the [php service documentation](./php.md).


### Using custom config files

You may need to override our [default Magento config](https://github.com/lando/lando/tree/master/plugins/lando-recipes/recipes/magento) with your own.

If you do this you must use files that exists inside your applicaton and express them relative to your project root as below.

Note that the default files may change based on how you set both `ssl` and `via`. Also note that the `vhosts` and `server` config will be explicitly for `nginx`. We *highly recommend* you check out the [nginx](./nginx.md#configuration) if you plan to use a custom `vhosts` or `server` config.

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory in the below example but you can call it whatever you want such as `.lando`.

```bash
./
|-- config
   |-- default.conf
   |-- my-custom.cnf
   |-- nginx.conf
   |-- php.ini
|-- index.php
|-- .lando.yml
```

**Landofile using custom Magento config**

```yaml
recipe: magento
config:
  config:
    database: config/my-custom.cnf
    php: config/php.ini
    vhosts: config/default.conf
```

## Connecting to your database

Lando will automatically set up a database with a user and password and also set an environment variables called [`LANDO INFO`](./../guides/lando-info.md) that contains useful information about how your application can access other Lando services.

Here are is the default database connection information for a LEMP site. Note that the `host` is not `localhost` but `database`.

Environment File
----------------

You may specify a `.env` file for Lando to include in your project. This can be helpful if you have setup scripts to help you automate configuring your Magento dev environment for use with Lando.

If you choose to do implement a `.env` file, below is an example of how you may consider doing so given the default database, cache, session and appserver services and based on the [Getting Started](#getting-started) tutorial above.

```bash
APP_URL=http://my-first-laravel-app.lndo.site

# If you set `database: mysql|mariadb` in this recipes config
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=magento
DB_USERNAME=magento
DB_PASSWORD=magento

CACHE_BACKEND=redis
CACHE_HOST=cache
CACHE_PASSWORD=null
CACHE_PORT=6379

SESSION_BACKEND=redis
SESSION_HOST=session
SESSION_PASSWORD=null
SESSION_PORT=6379
```

Connecting to your database and/or cache
----------------------------------------

Lando will automatically set up a database with a user and password and also set an environment variables called [`LANDO INFO`](./../guides/lando-info.md) that contains useful information about how your application can access other Lando services.

Here are is the default database connection information for a Magento site. Note that the `host` is not `localhost` but `database`.

```yaml
# MariaDB|MySQL
database: magento
username: magento
password: magento
host: database
port: 3306
```

Here are the default connection settings for the caching backend.

```yaml
host: cache
# Redis
port: 6379
```

Here are the default connection settings for the session backend.

```yaml
host: session
# Redis
port: 6379
```

You can get also get the above information, and more, by using the [`lando info`](./../cli/info.md) command.

## Importing Your Database

Once you've started up your Magento site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

```bash
# Grab your database dump
curl -fsSL -o database.sql.gz "https://url.to.my.db/database.sql.gz"

# Import the database
# NOTE: db-import can handle uncompressed, gzipped or zipped files
# Due to restrictions in how Docker handles file sharing your database
# dump MUST exist somewhere inside of your app directory.
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./../guides/db-import.md)

Quickly Setup a Fresh Install
-----------------------------

For convenience, this Lando recipe comes bundled with a command to help you reset your Magento to "stock" settings - that is, your database is destroyed and built anew!

```bash
# Drop all Magento tables, rebuild them, and configure Magento to use Lando services
lando magento:fresh
```

Tooling
-------

By default each Lando Magento recipe will also ship with helpful dev utilities.

This means you can use things like `magento`, `magerun`, `composer` and `php` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer           Runs composer commands
lando db-export [file]   Exports database from a service into a file
lando db-import <file>   Imports a dump file into database service
lando magento            Magento CLI tools
lando magento:env:apply  Configures Magento to use Lando's redis and database services
lando magento:fresh      Destroys your database, installs composer dependencies, and installs a brand new Magento!
lando magerun            netz98 magerun CLI tools for Magento 2
lando mysql              Drops into a MySQL shell on a database service
lando php                Runs php commands
```

**Usage examples**

```bash
# List available Magento CLI commands
lando magento list

# List available N98-Magerun CLI commands
lando magerun list

# Configures Magento to use Lando's redis and database services
lando magento:env:apply

# Destroys your database, installs composer dependencies, and installs a brand new Magento!
lando magento:fresh

# Download a dependency with drush
lando composer require phpunit/phpunit --dev

# Run composer tests
lando db-import dump.sql.gz

# Drop into a mysql shell
lando mysql

# Check the app's installed php extensions
lando php -m
```

You can also run `lando` from inside your app directory for a complete list of commands which is always advisable as your list of commands may not 100% be the same as the above. For example if you set `database: postgres` you will get `lando psql` instead of `lando mysql`.

<RelatedGuides tag="LEMP"/>
