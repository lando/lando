Working with Backdrop
=====================

Lando offers a [configurable recipe](./../recipes/backdrop.md) for spinning up [Backdrop CMS](https://backdropcms.org/) apps. Let's go over some basic usage.

Getting Started
---------------

Before you can use all the awesome Lando magic you need a Backdrop codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### 1. Start with an existing codebase

```bash
# Clone or extract your backdrop site
# See: https://backdropcms.org/installation
git clone https://github.com/backdrop/backdrop.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
lando init mysite --recipe backdrop
```

### 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Backdrop .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.lndo.io/cli/init.html#github
lando init mysite github --recipe backdrop
```

Once you've initialized the `.lando.yml` file for your app you should commit it to your repository. This will allow you to forgo the `lando init` step in subsequent clones.

Starting Your Site
------------------

Once you've completed the above you should be able to start your Backdrop site.

```bash
lando start
```

If you visit any of the green-listed URLs that show up afterwards you should be welcomed with the Backdrop installation screen. Read below on how to import your database.

Importing Your Database
-----------------------

Once you've started up your Backdrop site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

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

Each Lando Backdrop recipe will also ship with helpful dev utilities. This means you can use things like `drush`, `composer` and `php-cli` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer                 Run composer commands
lando db-import <file>         Import <file> into database. File is relative to approot.
lando drush                    Run drush commands
lando mysql                    Drop into a MySQL shell
lando php                      Run php commands
```

```bash
# Download a dependency with drush
lando drush dl views

# Download a dependency with composer
lando composer config repositories.drupal composer https://packages.drupal.org/8
lando composer require "drupal/search_api_pantheon ~1.0" --prefer-dist

# Check hte app's php version
lando php -v
```

You can also run `lando` from inside your app directory for a complete list of commands.

Configuration
-------------

### Recipe

You can also manually configure the `.lando.yml` file to switch `php` versions, toggle between `apache` and `nginx`, activate `xdebug`, choose a database type and version, set a custom webroot locaton and use your own configuration files.

{% codesnippet "./../examples/backdrop/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/backdrop).

### Environment Variables

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

`BACKDROP_SETTINGS` should allow for Backdrop to automatically connect to your database.

```bash
BACKDROP_SETTINGS=JSON_STRING_OF_BACKDROP_SETTINGS
DB_HOST=database
DB_USER=backdrop
DB_PASSWORD=backdrop
DB_NAME=backdrop
DB_PORT=3306
```

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. Note that these can vary based on the choices you make in your recipe config.

Advanced Service Usage
----------------------

You can get more in-depth information about the services this recipe provides by running `lando info`.

Next Steps
----------

*   [Adding additional services](./../tutorials/setup-additional-tooling.md)
*   [Adding additional tooling](./../tutorials/tutorials/setup-additional-tooling.md)
*   [Adding additional routes](./../tutorials/tutorials/setup-additional-routes.md)
*   [Setting up front end tooling](./../tutorials/tutorials/frontend.md)
*   [Accessing services (eg your database) from the host](./../tutorials/tutorials/frontend.md)
*   [Importing databases](./../tutorials/tutorials/db-import.md)
