Working with Joomla
===================

Lando offers a [configurable recipe](./../recipes/joomla.md) for spinning up [Joomla](https://joomla.org/) apps. Let's go over some basic usage.

<!-- toc -->

Getting Started
---------------

Before you can use all the awesome Lando magic you need a Joomla codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### Option 1. Start with an existing codebase

```bash
# Clone or extract your Joomla site
# See: https://github.com/joomla/joomla-cms
git clone https://github.com/joomla/joomla-cms.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
lando init --recipe joomla
```

### Option 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Joomla .lando.yml after getting code from GitHub
# This requires a GitHub Personal Access Token
# See: https://docs.devwithlando.io/cli/init.html#github
lando init github --recipe joomla
```

Once you've initialized the `.lando.yml` file for your app you should commit it to your repository. This will allow you to forgo the `lando init` step in subsequent clones.

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
composer                 Run composer commands
config                   Display the lando configuration
db-export [file]         Export a database. Resulting file: {DB_NAME}.TIMESTAMP.gz
db-import [file]         Import into database.
destroy [appname]        Destroy app in current directory or [appname]
info [appname]           Prints info about app in current directory or [appname]
init [method]            Initialize a lando app, optional methods: github, pantheon
joomla                   Run joomla commands
list                     List all lando apps
logs [appname]           Get logs for app in current directory or [appname]
mysql                    Drop into a MySQL shell
php                      Run php commands
poweroff                 Spin down all lando related containers
rebuild [appname]        Rebuilds app in current directory or [appname]
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

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
DB_HOST=database
DB_USER=joomla
DB_PASSWORD=joomla
DB_NAME=joomla
DB_PORT=3306
```

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. Note that these can vary based on the choices you make in your recipe config.

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
