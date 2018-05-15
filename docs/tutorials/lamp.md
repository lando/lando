Working with LAMP
=================

Lando offers a configurable recipe for spinning up apps that use the [LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) stack, a common infrastructure designed to run PHP applications.

Note that you'll only want to use this recipe if you have a custom PHP application not supported by one of Lando's other recipes. Let's go over some basic usage.

<!-- toc -->

Getting Started
---------------

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../installation/system-requirements.md)
2. [Read up on how to get a `.lando.yml`](./../started.md)

If after reading #2 above you are still unclear how to get started then try this

```bash
# Go into a local folder with your site or app codebase
# You can get this via git clone or from an archive
cd /path/to/my/codebase

# Initialize a basic .lando.yml file for my recipe with sane defaults
lando init

# Commit the .lando.yml to your git repo (Optional but recommended)
git add -A
git commit -m "Adding Lando configuration file for easy and fun local development!"
git push
```

For more info on how `lando init` works check out [this](./../cli/init.md).

Starting Your Site
------------------

Once you've completed the above you should be able to start your LAMP site.

```bash
# Start up app
lando start

# Optionally run composer install if needed
lando composer install
```

If you visit any of the green-listed URLS that show up afterwards you should be presented with whatever content is rendered by your `index.php`.

Importing Your Database
-----------------------

If you have an existing database for your application, you can easily import it done using our helpful `lando db-import` command.

```bash
# Go into my app
cd /path/to/my/app

# Grab your database dump
curl -fsSL -o database.sql.gz "https://url.to.my.db/database.sql.gz"

# Import the database
# NOTE: db-import can handle uncompressed, gzipped or zipped files
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./db-import.md).

Tooling
-------

Each LAMP recipe will also ship with some helpful php dev utilities. This means you can use things like `composer` and `php-cli` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer                 Run composer commands
lando db-import <file>         Import <file> into database. File is relative to approot.
lando db-export                Export a database. Resulting file: {DB_NAME}.TIMESTAMP.gz
lando mysql|pgsql              Drops into either a MySQL or Postgres shell depending on what DB you use
lando php                      Run php commands
```

```bash
# Run composer install
lando composer require guzzlehttp/guzzle

# Drop into a mysql shell
lando mysql

# Check the app's php version
lando php -v
```

You can also run `lando` from inside your app directory for a complete list of commands.

Configuration
-------------

### Recipe

You can also manually configure the `.lando.yml` file to switch `php` versions, toggle between `apache` and `nginx`, activate `xdebug`, choose a database type and version, set a custom webroot locaton and use your own configuration files.

{% codesnippet "./../examples/lamp2/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/lamp2).

### Environment Variables

The below are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
# The below is a specific example to ILLUSTRATE the KINDS of things provided by this variable
# The content of your variable may differ
LANDO_INFO={"appserver":{"type":"php","version":"7.1","hostnames":["appserver"],"via":"nginx","webroot":"web","config":{"server":"/Users/pirog/.lando/services/config/lamp/lamp.conf","conf":"/Users/pirog/.lando/services/config/lamp/php.ini"}},"nginx":{"type":"nginx","version":"1.13","hostnames":["nginx"],"webroot":"web","config":{"server":"/Users/pirog/.lando/services/config/lamp/lamp.conf","conf":"/Users/pirog/.lando/services/config/lamp/php.ini"}},"database":{"type":"mysql","version":"5.7","hostnames":["database"],"creds":{"user":"lamp","password":"lamp","database":"lamp"},"internal_connection":{"host":"database","port":3306},"external_connection":{"host":"localhost","port":true},"config":{"confd":"/Users/pirog/.lando/services/config/lamp/mysql"}}}
```

**NOTE:** These can vary based on the choices you make in your recipe config.
**NOTE:** See [this tutorial](./../tutorials/lando-info.md) for more information on how to properly use `$LANDO_INFO`.

### Automation

You can take advantage of Lando's [events framework](./../config/events.md) to automate common tasks. Here are some useful examples you can drop in your `.lando.yml` to make your LAMP app super slick.

```yml
events:

  # Runs composer install and a custom php script after your app starts
  post-start:
    - appserver: cd $LANDO_MOUNT && composer install
    - appserver: cd $LANDO_WEBROOT && php script.php

```

Advanced Service Usage
----------------------

You can get more in-depth information about the services this recipe provides by running `lando info`.

Read More
---------

### Workflow Docs

*   [Using Composer to Manage a Project](http://docs.devwithlando.io/tutorials/composer-tutorial.html)
*   [Lando and CI](http://docs.devwithlando.io/tutorials/lando-and-ci.html)
*   [Lando, Pantheon, CI, and Behat (BDD)](http://docs.devwithlando.io/tutorials/lando-pantheon-workflow.html)
*   [Killer D8 Workflow with Platform.sh](https://thinktandem.io/blog/2017/10/23/killer-d8-workflow-using-lando-and-platform-sh/)

### Advanced Usage

*   [Adding additional services](http://docs.devwithlando.io/tutorials/setup-additional-services.html)
*   [Adding additional tooling](http://docs.devwithlando.io/tutorials/setup-additional-tooling.html)
*   [Adding additional routes](http://docs.devwithlando.io/config/proxy.html)
*   [Adding additional events](http://docs.devwithlando.io/config/events.html)
*   [Setting up front end tooling](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Accessing services (eg your database) from the host](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Importing SQL databases](http://docs.devwithlando.io/tutorials/db-import.html)
*   [Exporting SQL databases](http://docs.devwithlando.io/tutorials/db-export.html)
