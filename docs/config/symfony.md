---
description: Use Symfony on Lando for local development; powered by Docker and Docker Compose, config php version, swap db or caching backends or web server, use composer. symfony console, xdebug and custom config files, oh and also import and export databases.
---

# Symfony

Symfony is a PHP framework for web projects.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [Symfony](https://symfony.com/) apps.

[[toc]]

## Getting Started

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../installation/system-requirements.md) and gotten familar with [its basics](./../started.md)
2. [Initialized](./../cli/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM) you can also run the following commands to try out this recipe with a vanilla install of Symfony.

```bash
# Initialize a symfony recipe
lando init \
  --source cwd \
  --recipe symfony \
  --webroot public \
  --name my-first-symfony-app

# Install symfony
lando composer create-project symfony/website-skeleton tmp && cp -r tmp/. . && rm -rf tmp

# Install other Symfony dependencies you may like
lando composer require annotations asset doctrine encore form logger maker profiler security security-guard stof/doctrine-extensions-bundle twig validator var-dumper

# Start it up
lando start

# List information about this app.
lando info

# Run bin/console commands with: lando console
# Here is how to clear cache; 
lando console cache:clear
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe. If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: symfony
config:
  php: '7.4'
  via: apache:2.4
  webroot: .
  database: mysql:5.7
  cache: none
  xdebug: false
  config:
    database: SEE BELOW
    php: SEE BELOW
    server: SEE BELOW
    vhosts: SEE BELOW
```

Note that if the above config options are not enough all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a php version

You can set `php` to any version that is available in our [php service](./php.md). However, you should consult the [Symfony requirements](https://symfony.com/doc/current/reference/requirements.html) to make sure that version is actually supported by Symfony itself.

Here is the [recipe config](./../config/recipes.md#config) to set the Symfony recipe to use `php` version `7.3`

```yaml
recipe: symfony
config:
  php: '7.3'
```

### Choosing a web server

By default this recipe will be served by the default version of our [apache](./apache.md) service but you can also switch this to use [`nginx`](./nginx.md). We *highly recommend* you check out both the [apache](./apache.md) and [nginx](./nginx.md) services before you change the default `via`.

#### With Apache (default)

```yaml
recipe: symfony
config:
  via: apache
```

#### With nginx

```yaml
recipe: symfony
config:
  via: nginx
```

### Choosing a database backend

By default, this recipe will use the default version of our [mysql](./mysql.md) service as the database backend but you can also switch this to use [`mariadb`](./mariadb.md) or ['postgres'](./postgres.md) instead. Note that you can also specify a version *as long as it is a version available for use with lando* for either `mysql`, `mariadb` or `postgres`.

If you are unsure about how to configure the `database`, we *highly recommend* you check out the [mysql](./mysql.md), [mariadb](./mariadb.md)and ['postgres'](./postgres.md) services before you change the default.

#### Using MySQL (default)

```yaml
recipe: symfony
config:
  database: mysql
```

#### Using MariaDB

```yaml
recipe: symfony
config:
  database: mariadb
```

#### Using Postgres

```yaml
recipe: symfony
config:
  database: postgres
```

#### Using a custom version

```yaml
recipe: symfony
config:
  database: postgres:14
```

### Choosing a caching backend

By default this recipe will not spin up a caching backend.

However, you can specify one using the `cache` recipe config and setting it to use either our use [`redis`](./redis.md) or [`memcached`](./memcached.md) service. Note that you can optionally/additionally specify a particular version for either *as long as it is a version documented as available for use with lando* for either service.

If you are unsure about how to configure the `cache` we *highly recommend* you check out our [redis](./redis.md) and [memcached](./memcached.md)) docs as well as the [Symfony ones](https://symfony.com/doc/current/cache.html).

#### Using redis (recommended)

```yaml
recipe: symfony
config:
  cache: redis
```

#### Using Memcached

```yaml
recipe: symfony
config:
  cache: memcached
```

#### Using a custom version

```yaml
recipe: symfony
config:
  cache: redis:2.8
```

### Using xdebug

This is just a passthrough option to the [xdebug setting](./php.md#toggling-xdebug) that exists on all our [php services](./php.md). The `tl;dr` is `xdebug: true` enables and configures the php xdebug extension and `xdebug: false` disables it.

```yaml
recipe: symfony
config:
  xdebug: true|false
```

However, for more information we recommend you consult the [php service documentation](./php.md).

### Using custom config files

You may need to override our [default Symfony config](https://github.com/lando/lando/tree/master/plugins/lando-recipes/recipes/symfony) with your own.

If you do this you must use files that exists inside your applicaton and express them relative to your project root as below.

Note that the default files may change based on how you set both `ssl` and `via`. Also note that the `vhosts` and `server` config will be either for `apache` or `nginx` depending on how you set `via`. We *highly recommend* you check out both the [apache](./apache.md#configuration) and [nginx](./nginx.md#configuration) if you plan to use a custom `vhosts` or `server` config.

#### A hypothetical project

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory in the below example but you can call it whatever you want such as `.lando`.

```bash
./
|-- config
   |-- default.conf
   |-- my-custom.cnf
   |-- php.ini
   |-- server.conf
|-- index.php
|-- .lando.yml
```

#### Landofile using custom symfony config

```yaml
recipe: symfony
config:
  config:
    database: config/my-custom.cnf
    php: config/php.ini
    server: config/server.conf
    vhosts: config/default.conf
```

## Environment File

By default, Symfony comes with a `.env` configuration file. You will want to modify the following `.env` key so that it makes sense for use with Lando.

Here is what that file would look like if you installed symfony [as above](#getting-started). Note that your file might be slightly different depending on your configuration.

```bash
# In all environments, the following files are loaded if they exist,
# the later taking precedence over the former:
#
#  * .env                contains default values for the environment variables needed by the app
#  * .env.local          uncommitted file with local overrides
#  * .env.$APP_ENV       committed environment-specific defaults
#  * .env.$APP_ENV.local uncommitted environment-specific overrides
#
# Real environment variables win over .env files.
#
# DO NOT DEFINE PRODUCTION SECRETS IN THIS FILE NOR IN ANY OTHER COMMITTED FILES.
#
# Run "composer dump-env prod" to compile .env files for production use (requires symfony/flex >=1.2).
# https://symfony.com/doc/current/best_practices/configuration.html#infrastructure-related-configuration

###> symfony/framework-bundle ###
APP_ENV=dev
APP_SECRET=7045ca855d01cf6b008c6744bff58916
#TRUSTED_PROXIES=127.0.0.1,127.0.0.2
#TRUSTED_HOSTS='^localhost|example\.com$'
###< symfony/framework-bundle ###

###> doctrine/doctrine-bundle ###
# Format described at http://docs.doctrine-project.org/projects/doctrine-dbal/en/latest/reference/configuration.html#connecting-using-a-url
# For an SQLite database, use: "sqlite:///%kernel.project_dir%/var/data.db"
# Configure your db driver and server_version in config/packages/doctrine.yaml
DATABASE_URL=mysql://symfony:symfony@database/symfony
###< doctrine/doctrine-bundle ###

###> symfony/swiftmailer-bundle ###
# For Gmail as a transport, use: "gmail://username:password@localhost"
# For a generic SMTP server, use: "smtp://localhost:25?encryption=&auth_mode="
# Delivery is disabled by default via "null://localhost"
MAILER_URL=null://localhost
###< symfony/swiftmailer-bundle ###
```

## Connecting to your database and/or cache

Lando will automatically set up a database with a user and password and also set an environment variables called [`LANDO INFO`](./../guides/lando-info.md) that contains useful information about how your application can access other Lando services.

Here are is the default database connection information for a Symfony site. Note that the `host` is not `localhost` but `database`.

```yaml
database: symfony
username: symfony
password: symfony
host: database
# for mysql
port: 3306
# for postgres
# port: 5432
```

If you've also specified a caching backend here are the default connection settings.

```yaml
host: cache
# Redis
port: 6379
# Memcache
port: 11211
```

You can get also get the above information, and more, by using the [`lando info`](./../cli/info.md) command.

## Importing Your Database

Once you've started up your Symfony site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

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

## Tooling

By default each Lando Symfony recipe will also ship with helpful dev utilities.

This means you can use things like `console`, `composer` and `php` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer          Runs composer commands
lando console           Runs console commands
lando db-export [file]  Exports database from a service into a file
lando db-import <file>  Imports a dump file into database service
lando mysql             Drops into a MySQL shell on a database service
lando php               Runs php commands
```

### Usage examples

```bash
# Do a basic cache clear
lando console cache:clear

# Run composer install
lando composer install

# Drop into a mysql shell
lando mysql

# Check the app's php version
lando php -v
```

You can also run `lando` from inside your app directory for a complete list of commands which is always advisable as your list of commands may not 100% be the same as the above. For example if you set `database: postgres` you will get `lando psql` instead of `lando mysql`.

<RelatedGuides tag="Symfony"/>
