Magento
=======

Magento 2, a cutting-edge, feature-rich eCommerce solution that gets results.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [Magento](https://magento.com/products/magento-commerce) apps.

<!-- toc -->

Getting Started
---------------

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../installation/system-requirements.md) and gotten familar with [its basics](./../started.md)
2. [Initialized](./../cli/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM) you can also run the following commands to try out this recipe with a vanilla install of Magento.

```bash
# Initialize a Magento recipe
lando init \
  --source cwd \
  --recipe magento \
  --webroot app/pub \
  --name my-first-magento-app

# Install Magento
lando ssh -c "composer create-project --repository=https://repo.magento.com/ magento/project-community-edition app"

# Or, to install Magento without Magento Credentials, @see: https://store.fooman.co.nz/blog/no-authentication-needed-magento-2-mirror.html

# Start it up
lando start

# List information about this app.
lando info
```

Configuration
-------------

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe. If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: magento
config:
  php: 7.2
  via: nginx
  webroot: pub
  database: mariadb:10.2
  xdebug: false
  config:
    database: SEE BELOW
    php: SEE BELOW
    server: SEE BELOW
    vhosts: SEE BELOW
```

Note that if the above config options are not enough all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a php version

You can set `php` to any version that is available in our [php service](./php.md). However, you should consult the [Magento requirements](https://devdocs.magento.com/guides/v2.3/install-gde/system-requirements-tech.html) to make sure that version is actually supported by Magento itself.

Here is the [recipe config](./../config/recipes.md#config) to set the Magento recipe to use `php` version `7.1`

```yaml
recipe: magento
config:
  php: 7.1
```

### Webserver

This Magento recipe currently only supports NGINX. Apache support may be provided in future releases.

### Choosing a database backend

By default this recipe will use the latest Magento-supported version of [mariadb](./mariadb.md) service as the database backend but you can also switch this to use [`mysql`](./mysql.md). Note that you can also specify a version *as long as it is a version available for use with lando* for either `mysql`, `mariadb` or `postgres`.

If you are unsure about how to configure the `database` we *highly recommend* you check out the [mysql](./mysql.md), [mariadb](./mariadb.md)and ['postgres'](./postgres.md) services before you change the default.

Also note that like the configuration of the `php` version you should consult the [Magento requirements](https://devdocs.magento.com/guides/v2.3/install-gde/system-requirements-tech.html) to make sure the `database` and `version` you select is actually supported by Magento itself.

** Using MariaDB (default) **

```yaml
recipe: magento
config:
  database: mariadb:10.2
```

** Using MySQL **

```yaml
recipe: magento
config:
  database: mysql:5.7
```

### Choosing a caching and session backend

By default this recipe will spin up a Redis cache and session service at the Magento-recommended version of 3.2

However, you can disable or [override the service version](../config/services.md#overrides) as needed.

** Disabling default Redis services **

```yaml
recipe: magento
config:
  cache: false
  session: false
```

This recipe comes with a helpful command to auto-configure Redis sessions and cache services for Magento.

** Auto-Configure Redis for Magento **

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

Note that the default files may change based on how you set both `ssl`. 

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory in the below example but you can call it whatever you want such as `.lando`.

```bash
./
|-- config
   |-- default.conf
   |-- my-custom.cnf
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

Importing Your Database
-----------------------

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

# Run composer install
lando composer install

# Drop into a mysql shell
lando mysql

# Check the app's php version
lando php -v
```

You can also run `lando` from inside your app directory for a complete list of commands which is always advisable as your list of commands may not 100% be the same as the above.

Example
-------

If you are interested in a working example of this recipe that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/magento](https://github.com/lando/lando/tree/master/examples/magento)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
