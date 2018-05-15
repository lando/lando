Working with Joomla
===================

Lando offers a configurable recipe for spinning up [Joomla](https://joomla.org/) apps. Let's go over some basic usage.

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

Once you've completed the above you should be able to start your Joomla site.

```bash
# Start up app
lando start

# Optionally run composer install if needed
lando composer install
```

If you visit any of the green-listed URLs that show up afterwards you should be welcomed with the Joomla installation screen.

If you are installing Joomla from scratch will also want to scope out your database credentials by running `lando info` so you can be prepped to enter them during the Joomla installation. You will want to use `internal_connection` information. Note that you will likely have to open up the `Advanced Settings` during the Joomla database configuration to change the hostname.

Or you can read below on how to import your database.

Importing Your Database
-----------------------

Once you've started up your Joomla site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

```bash
# Go into my app
cd /path/to/my/app

# Grab your database dump
curl -fsSL -o database.sql.gz "https://url.to.my.db/database.sql.gz"

# Import the database
# NOTE: db-import can handle uncompressed, gzipped or zipped files
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./db-import.md)

Tooling
-------

Each Lando Joomla recipe will also ship with helpful dev utilities. This means you can use things like `joomla`, `composer` and `php-cli` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer                 Run composer commands
lando db-export [file]         Export a database. Resulting file: {DB_NAME}.TIMESTAMP.gz
lando db-import [file]         Import into database.
lando joomla                   Run joomla commands
lando mysql                    Drop into a MySQL shell
lando php                      Run php commands
```

```bash
# Get joomla cli help
lando joomla help

# Clear the joomla cache
lando joomla cache:clear

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

You can also manually configure the `.lando.yml` file to switch `php` or `joomla` versions, toggle between `apache` and `nginx`, activate `xdebug`, choose a database type and version, set a custom webroot locaton and use your own configuration files.

{% codesnippet "./../examples/joomla/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/joomla).

### Environment Variables

The below are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
# The below is a specific example to ILLUSTRATE the KINDS of things provided by this variable
# The content of your variable may differ
LANDO_INFO={"appserver":{"type":"php","version":"7.1","hostnames":["appserver"],"via":"nginx","webroot":"web","config":{"server":"/Users/pirog/.lando/services/config/joomla/joomla.conf","conf":"/Users/pirog/.lando/services/config/joomla/php.ini"}},"nginx":{"type":"nginx","version":"1.13","hostnames":["nginx"],"webroot":"web","config":{"server":"/Users/pirog/.lando/services/config/joomla/joomla.conf","conf":"/Users/pirog/.lando/services/config/joomla/php.ini"}},"database":{"type":"mysql","version":"5.7","hostnames":["database"],"creds":{"user":"joomla","password":"joomla","database":"joomla"},"internal_connection":{"host":"database","port":3306},"external_connection":{"host":"localhost","port":true},"config":{"confd":"/Users/pirog/.lando/services/config/joomla/mysql"}}}
```

**NOTE:** These can vary based on the choices you make in your recipe config.
**NOTE:** See [this tutorial](./../tutorials/lando-info.md) for more information on how to properly use `$LANDO_INFO`.

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
