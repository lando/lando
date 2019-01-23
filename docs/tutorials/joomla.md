Joomla
======

Joomla! is an award-winning content management system (CMS), which enables you to build web sites and powerful online applications.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [Joomla](https://www.joomla.org/) apps.

<!-- toc -->

Getting Started
---------------

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../installation/system-requirements.md) and gotten familar with [its basics](./../started.md)
2. [Initialized](./../cli/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM) you can also run the following commands to try out this recipe with a vanilla install of Joomla.

```bash
# Initialize a joomla recipe using the latest Joomla version
lando init \
  --source remote \
  --remote-url https://downloads.joomla.org/cms/joomla3/3-9-2/Joomla_3-9-2-Stable-Full_Package.tar.gz \
  --recipe joomla \
  --webroot . \
  --name my-first-joomla-app

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
recipe: joomla
config:
  php: 7.2
  via: apache:2.4
  webroot: .
  database: mysql:5.7
  xdebug: false
  config:
    php: SEE BELOW
    database: SEE BELOW
```

Note that if the above config options are not enough all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a php version

You can set `php` to any version that is available in our [php service](./php.md). However, you should consult the [Joomla requirements](https://downloads.joomla.org/us/technical-requirements-us) to make sure that version is actually supported by Joomla itself.

Here is the [recipe config](./../config/recipes.md#config) to set the Joomla recipe to use `php` version `7.1`

```yaml
recipe: joomla
config:
  php: 7.1
```

### Choosing a webserver

By default this recipe will be served by the default version of our [apache](./apache.md) service but you can also switch this to use [`nginx`](./nginx.md). We *highly recommend* you check out both the [apache](./apache.md) and [nginx](./nginx.md) services before you change the default `via`.

** With Apache (default) **

```yaml
recipe: joomla
config:
  via: apache
```

** With nginx **

```yaml
recipe: joomla
config:
  via: nginx
```

### Choosing a database backend

By default this recipe will use the default version of our [mysql](./mysql.md) service as the database backend but you can also switch this to use [`mariadb`](./mariadb.md) or ['postgres'](./postgres.md) instead. Note that you can also specify a version *as long as it is a version available for use with lando* for either `mysql`, `mariadb` or `postgres`.

If you are unsure about how to configure the `database` we *highly recommend* you check out the [mysql](./mysql.md), [mariadb](./mariadb.md)and ['postgres'](./postgres.md) services before you change the default.

Also note that like the configuration of the `php` version you should consult the [Joomla requirements](https://downloads.joomla.org/us/technical-requirements-us) to make sure the `database` and `version` you select is actually supported by Joomla itself.

** Using MySQL (default) **

```yaml
recipe: joomla
config:
  database: mysql
```

** Using MariaDB **

```yaml
recipe: joomla
config:
  database: mariadb
```

** Using Postgres **

```yaml
recipe: joomla
config:
  database: postgres
```

** Using a custom version **

```yaml
recipe: joomla
config:
  database: postgres:9.6
```

### Using xdebug

This is just a passthrough option to the [xdebug setting](./php.md#toggling-xdebug) that exists on all our [php services](./php.md). The `tl;dr` is `xdebug: true` enables and configures the php xdebug extension and `xdebug: false` disables it.

```yaml
recipe: joomla
config:
  xdebug: true|false
```

However, for more information we recommend you consult the [php service documentation](./php.md).


### Using custom config files

You may need to override our [default Joomla config](https://github.com/lando/lando/tree/master/plugins/lando-recipes/recipes/joomla) with your own.

If you do this you must use files that exists inside your applicaton and express them relative to your project root as below.

**A hypothetical project**

```bash
./
|-- config
   |-- my-custom.cnf
   |-- php.ini
|-- index.php
|-- .lando.yml
```

**Landofile using custom joomla config**

```yaml
recipe: joomla
config:
  config:
    php: config/php.ini
    database: config/my-custom.cnf
```

Connecting to your database
---------------------------

Lando will automatically set up a database with a user and password and also set an environment variables called [`LANDO INFO`](./../guides/lando-info.md) that contains useful information about how your application can access other Lando services.

Here are is the default database connection information for a Joomla site. Note that the `host` is not `localhost` but `database`.

```yaml
database: joomla
username: joomla
password: joomla
host: database
# for mysql
port: 3306
# for postgres
# port: 5432
```

You can get also get the above information, and more, by using the [`lando info`](./../cli/info.md) command.

Importing Your Database
-----------------------

Once you've started up your Joomla site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

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

Tooling
-------

By default each Lando Joomla recipe will also ship with helpful dev utilities.

This means you can use things like `joomla`, `composer` and `php` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer          Runs composer commands
lando db-export [file]  Exports database from a service into a file
lando db-import <file>  Imports a dump file into database service
lando joomla            Runs joomla commands
lando mysql             Drops into a MySQL shell on a database service
lando php               Runs php commands
```

**Usage examples**

```bash
# Get joomla cli help
lando joomla -h

# Clear the joomla cache
lando joomla cache:clear

# Run composer tests
lando composer test

# Drop into a mysql shell
lando mysql

# Check hte app's installed php extensions
lando php -m
```

You can also run `lando` from inside your app directory for a complete list of commands which is always advisable as your list of commands may not 100% be the same as the above. For example if you set `database: postgres` you will get `lando psql` instead of `lando mysql`.

Example
-------

If you are interested in a working example of this recipe that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/joomla](https://github.com/lando/lando/tree/master/examples/joomla)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
