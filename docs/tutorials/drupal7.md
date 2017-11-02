Working with Drupal 7
=====================

Lando offers a [configurable recipe](./../recipes/drupal7.md) for spinning up [Drupal 7](https://drupal.org/) apps. Let's go over some basic usage.

<!-- toc -->

Getting Started
---------------

Before you can use all the awesome Lando magic you need a Drupal 7 codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### Option 1. Start with an existing codebase

```bash
# Clone or extract your Drupal 7 site
# See: https://github.com/drupal/drupal/tree/7.x
git clone -b 7.x https://github.com/drupal/drupal.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
lando init --recipe drupal7
```

### Option 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Drupal 7 .lando.yml after getting code from GitHub
# This requires a GitHub Personal Access Token
# See: https://docs.devwithlando.io/cli/init.html#github
lando init github --recipe drupal7
```

Once you've initialized the `.lando.yml` file for your app you should commit it to your repository. This will allow you to forgo the `lando init` step in subsequent clones.

If you want to try a composer based installation, you can use the [this example](https://github.com/lando/lando/tree/master/examples/drupal7-2) to get started.

Starting Your Site
------------------

Once you've completed the above you should be able to start your Drupal 7 site.

```bash
# Start up app
lando start

# List information about this app.
lando info

# Optionally run composer install if needed
lando composer install
```

If you visit any of the green-listed URLs that show up afterwards you should be welcomed with the Drupal 7 installation screen.

If you are installing Drupal 7 from scratch will also want to scope out your database credentials by running `lando info` so you can be prepped to enter them during the drupal installation. You will want to use `internal_connection` information. Note that you will likely have to open up the `Advanced Settings` during the Drupal 7 database configuration to change the hostname.

Or you can read below on how to import your database.

Importing Your Database
-----------------------

Once you've started up your Drupal 7 site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

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

You can learn more about the `db-import` command [over here](./db-import.md)

Tooling
-------

Each Lando Drupal 7 recipe will also ship with helpful dev utilities. This means you can use things like `drush`, `composer` and `php-cli` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer                 Run composer commands
lando db-import <file>         Import <file> into database. File is relative to approot.
lando db-export                Export a database. Resulting file: {DB_NAME}.TIMESTAMP.gz
lando drush                    Run drush commands
lando mysql                    Drop into a MySQL shell
lando php                      Run php commands
```

```bash
# Check the status of your site with drush
lando drush status

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

You can also manually configure the `.lando.yml` file to switch `php` or `drush` versions, toggle between `apache` and `nginx`, activate `xdebug`, choose a database type and version, set a custom webroot locaton and use your own configuration files.

{% codesnippet "./../examples/drupal7-2/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/drupal7-2).

### Environment Variables

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
DB_HOST=database
DB_USER=drupal7
DB_PASSWORD=drupal7
DB_NAME=drupal7
DB_PORT=3306
```

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. Note that these can vary based on the choices you make in your recipe config.

### Automation

You can take advantage of Lando's [events framework](./../config/events.md) to automate common tasks. Here are some useful examples you can drop in your `.lando.yml` to make your Drupal 7 app super slick.

```yml
events:

  # Revert features and clear caches after a database import
  post-db-import:
    - appserver: cd $LANDO_WEBROOT && drush fra -y
    - appserver: cd $LANDO_WEBROOT && drush cc all -y

  # Runs composer install and a custom php script after your app starts
  post-start:
    - appserver: cd $LANDO_MOUNT && composer install
    - appserver: cd $LANDO_WEBROOT && php script.php

```

Drush URL Setup
---------------

To set up your environment so that commands like `lando drush uli` return the proper URL, you will need to configure Drush.

Create or edit `/sites/default/settings.local.php` and add these lines:

```
// Set the base URL for the Drupal site.
$base_url = "http://mysite.lndo.site"
```


### Aliases

You can also use drush aliases with command like `lando drush @sitealias cc all` by adding the following to to your .lando.yml file: 

```
services:
  appserver:
    build:
      - "mkdir -p ~/.drush/site-aliases"
      - "ln -sf /app/drush/yoursite.aliases.drushrc.php ~/.drush/site-aliases/yoursite.drushrc.php"
 ```
 
Make sure the alias file exists within the drush folder in your app. For info on how to setup your alias please refer to the following [link](https://www.drupal.org/node/1401522).
 
Please refer the [ssh section](./../cli/ssh.html)if you need to set-up keys that require a passphrase.


Advanced Service Usage
----------------------

You can get more in-depth information about the services this recipe provides by running `lando info`.

Next Steps
----------

*   [Adding additional services](http://docs.devwithlando.io/tutorials/setup-additional-services.html)
*   [Adding additional tooling](http://docs.devwithlando.io/tutorials/setup-additional-tooling.html)
*   [Adding additional routes](http://docs.devwithlando.io/config/proxy.html)
*   [Adding additional events](http://docs.devwithlando.io/config/events.html)
*   [Setting up front end tooling](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Accessing services (eg your database) from the host](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Importing SQL databases](http://docs.devwithlando.io/tutorials/db-import.html)
*   [Exporting SQL databases](http://docs.devwithlando.io/tutorials/db-export.html)
*   [Using Composer to Manage a Project](http://docs.devwithlando.io/tutorials/composer-tutorial.html)
*   [Lando and CI](http://docs.devwithlando.io/tutorials/lando-and-ci.html)
*   [Lando, Pantheon, CI, and Behat (BDD)](http://docs.devwithlando.io/tutorials/lando-pantheon-workflow.html)
