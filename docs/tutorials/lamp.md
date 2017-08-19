Working with LAMP
=================

Lando offers a [configurable recipe](./../recipes/lamp.md) for spinning up apps that use the [LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) stack, a common infrastructure designed to run PHP applications.

Note that you'll only want to use this recipe if you have a custom PHP application not supported by one of Lando's other recipes. Let's go over some basic usage.

<!-- toc -->

Getting Started
---------------

Before you can use all the awesome LAMP Lando magic you need a codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### 1. Start with an existing codebase

```bash
# Clone codebase from git, un-tar codebase, receive as gift from the gods, etc.
git clone https://private-repository.com/lamp-project.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
lando init --recipe lamp
```

### 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite

# Initialize a LAMP .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.lndo.io/cli/init.html#github
lando init github --recipe lamp
```

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
lando db-import database.sql.gz --database=lamp
```

You can learn more about the `db-import` command [over here](./db-import.md).

Tooling
-------

Each LAMP recipe will also ship with some helpful php dev utilities. This means you can use things like `composer` and `php-cli` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer                 Run composer commands
lando db-import <file>         Import <file> into database. File is relative to approot.
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

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/lamp2).

### Environment Variables

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function. Note that these can vary based on the choices you make in your recipe config.

```bash
DB_HOST=database
DB_USER=lamp
DB_PASSWORD=lamp
DB_NAME=lamp
DB_PORT=3306
```

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container.

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

Next Steps
----------

*   [Adding additional services](./../tutorials/setup-additional-tooling.md)
*   [Adding additional tooling](./../tutorials/setup-additional-tooling.md)
*   [Adding additional routes](./../config/proxy.md)
*   [Adding additional events](./../config/events.md)
*   [Setting up front end tooling](./../tutorials/frontend.md)
*   [Accessing services (eg your database) from the host](./../tutorials/frontend.md)
*   [Importing databases](./../tutorials/db-import.md)
