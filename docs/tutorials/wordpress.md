Working with WordPress
======================

Lando offers a [configurable recipe](./../recipes/wordpress.md) for spinning up [WordPress](https://wordpress.org/) apps. Let's go over some basic usage.

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
git commit -m "MAKE LOCAL DEV GREAT AGAIN"
git push
```

For more info on how `lando init` works check out [this](./../cli/init.md).

Starting Your Site
------------------

Once you've completed the above you should be able to start your WordPress site.

```bash
# Start up app
lando start

# List information about this app.
lando info

# Optionally run composer install if needed
lando composer install
```

If you visit any of the green-listed URLs that show up afterwards you should be welcomed with the WordPress installation screen.

If you are installing WordPress from scratch will also want to scope out your database credentials by running `lando info` so you can be prepped to enter them during the installation. You will want to use `internal_connection` information.

Or you can read below on how to import your database.

Importing Your Database
-----------------------

Once you've started up your WordPress site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

```bash
# Go into my app
cd /path/to/my/app

# Grab your database dump
curl -fsSL -o database.sql.gz "https://url.to.my.db/database.sql.gz"

# Import the database
# NOTE: db-import can handle uncompressed, gzipped or zipped files
# Due to restrictions in how Docker handles file sharing your database
# dump MUST exist somewhere inside of your app directory.
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./db-import.md).

Tooling
-------

Each Lando WordPress recipe will also ship with helpful dev utilities. This means you can use things like `wp-cli`, `composer` and `php-cli` via Lando and avoid mucking up your actual computer trying to manage PHP versions and tooling.

```bash
lando composer                 Run composer commands
lando db-import <file>         Import <file> into database. File is relative to approot.
lando mysql                    Drop into a MySQL shell
lando php                      Run php commands
lando wp                       Run wp-cli commands
```

```bash
# Search-replace the domain name
wp search-replace 'some.old.domain' 'mysite.lndo.site'

# Run composer install
lando composer install

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

{% codesnippet "./../examples/wordpress/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/wordpress).

### Environment Variables

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
DB_HOST=database
DB_USER=wordpress
DB_PASSWORD=wordpress
DB_NAME=wordpress
DB_PORT=3306
```

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. Note that these can vary based on the choices you make in your recipe config.

### Automation

You can take advantage of Lando's [events framework](./../config/events.md) to automate common tasks. Here are some useful examples you can drop in your `.lando.yml` to make your WordPress app super slick.

```yml
events:

  # Runs composer install and a custom php script after your app starts
  post-start:
    - appserver: cd $LANDO_MOUNT && composer install
    - appserver: cd $LANDO_WEBROOT && php script.php

  # Runs wp search-replace after a db import
  post-db-import:
    - appserver: wp search-replace OLDURL NEWURL

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
