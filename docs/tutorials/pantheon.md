Working with Pantheon
=====================

Lando offers a [recipe](./../recipes/pantheon.md) for spinning up apps that closely mimic the [Pantheon](http://pantheon.io) environment. Let's go over some basic usage. You should also check out Pantheon's [local dev](https://pantheon.io/docs/local-development/) docs.

Getting Started
---------------

Before you can use all the awesome Lando magic you need a codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### 1. Start with an existing codebase

```bash
# Clone pantheon codebase from git
# See: https://pantheon.io/docs/git/
git clone ssh://codeserver.dev.PANTHEONID@codeserver.dev.PANTHEONIDdrush.in:2222/~/repository.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
# NOTE: You will need to choose the same site you cloned
lando init mysite --recipe pantheon
```

### 2. Get your site from Pantheon

```bash
# Create a folder to clone your site to
mkdir mysite

# Initialize a Pantheon .lando.yml after getting code from Pantheon
# This require a Pantheon Machine Token
# See: https://docs.lndo.io/cli/init.html#pantheon
lando init mysite pantheon
```

### 3. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite

# Initialize a Pantheon .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.lndo.io/cli/init.html#github
lando init mysite github --recipe pantheon
```

Starting Your Site
------------------

Once you've completed the above you should be able to start your Pantheon site. **AT THIS TIME WE WILL NOT AUTOMATICALLY PULL YOUR DATABASE AND FILES** but you can read below on how to do that with our helper commands or manually. If your Pantheon site has a `composer.json` Lando will attempt to run `composer install` on it automatically.

```bash
lando start
```

If you vist any of the green-listed URLS that show up afterwards you should be welcomed with either the Drupal, Backdrop or WordPress installation screens. Read below on how to import your database and file.

Importing Your Database and Files
---------------------------------

Importing my data
  Pulling files and data
  Manually files and data import
Tooling?
Config
  (envvars/
  pantheon.yml)
Advanced (redis/solr/varnish && lando info)
multidev?
Other helpful tutorials
  build steps (composer)
  front end

Import your Pantheon Database
-----------------------------

```bash
# Create a new backup of your database
lando terminus backup:create drupal-7-pantheon-basicz.dev --element=db

# Download and import backup of the database
lando terminus backup:get drupal-7-pantheon-basicz.dev --element=db --to=/tmp/database.sql.gz
lando ssh -c "cat /tmp/database.sql.gz | gunzip | mysql -h database pantheon"

# Drush to Verify
# If you are using a nested docroot make sure you go into web first
lando drush cc all
lando drush status
```

Import your Pantheon Files
--------------------------

If you've spun up a Lando app using one of our [recipes](./../config/recipes.md) then its likely relevant services are already exposed and ready for access.

```bash
# Create a new backup of your files
lando terminus backup:create drupal-7-pantheon-basicz.dev --element=files

# Download and extract backup of the files
lando terminus backup:get drupal-7-pantheon-basicz.dev --element=files --to=/tmp/files.tar.gz
lando ssh -c "tar -xzvf /tmp/files.tar.gz -C \$LANDO_MOUNT/\$FILEMOUNT --strip-components 1"
```

In the example above you can access the `mariadb` database from your host at `localhost:32787`. Note that this port is automatically assigned by Docker itself and will change every time you restart your app.

That said, Lando provides a way to "lock down" these ports so they are more predictable.

Other Helpful Things
--------------------

```bash
# Get a list of wp-cli commands
lando wp

# Download a dependency with drush
lando drush dl views

# Download a dependency with composer
lando composer config repositories.drupal composer https://packages.drupal.org/8
lando composer require "drupal/search_api_pantheon ~1.0" --prefer-dist

# Download a backdrop dependency
lando drush dl webform
```

Check out our [Pantheon Recipe](./../recipes/pantheon.md) for details on more advanced usage.



pantheon.yml
------------

If you want to [change your php version](https://pantheon.io/docs/php-versions/) or make use of a [nested docroot](https://pantheon.io/docs/nested-docroot/), you will want to do that in your [`pantheon.yml`](https://pantheon.io/docs/pantheon-yml/) file just like you would for Pantheon itself.

{% codesnippet "./../examples/pantheon/pantheon.yml" %}{% endcodesnippet %}

Installing
----------

You will want to make sure your codebase is fundamentally based on one of Pantheon's core upstreams:

*   [Backdrop](https://github.com/backdrop-ops/backdrop-pantheon)
*   [Drupal 6](https://github.com/pantheon-systems/drops-6)
*   [Drupal 7](https://github.com/pantheon-systems/drops-7)
*   [Drupal 8](https://github.com/pantheon-systems/drops-8)
*   [WordPress](https://github.com/pantheon-systems/WordPress)

If you do not do this, Lando will not know how to automatically handle things like your database connection or SOLR infrastructure.

```bash
# Pull a repo, init and start
git clone https://github.com/pantheon-systems/drops-8.git drupal8
cd drupal8
lando init --recipe pantheon

# Or pull from github but init as pantheon
lando init mysite github --recipe pantheon
lando start

# Or pull directly from pantheon
lando init mysite pantheon

# Visit https://mysite.lndo.site to complete your installation.

# Navigate to the webroot and check the status of your site with drush
cd web
lando drush status
```

Configuration
-------------

Like Pantheon, Lando will also [inject configuration](https://pantheon.io/docs/read-environment-config/) into your runtime container so that you have useful information stored about your app. These are stored directly in the environment (eg accessible via [`getenv()`](http://php.net/manual/en/function.getenv.php)), `$_ENV`, `$_SERVER` or as defined `php` constants.

Here is a non-exhuastive list of some of the most commonly used config.

```bash
# Site info
PANTHEON_BINDING: lando
PANTHEON_ENVIRONMENT: lando
PANTHEON_SITE_NAME: Your Pantheon site name
PANTHEON_SITE: Your Panthen UUID
FILEMOUNT: The location of your files directory
DOCROOT: /
FRAMEWORK: Either drupal, drupal8, backdrop, or wordpress
HTTP_X_SSL: ON or undefined
HTTPS: on or undefined

# Cache connection info
CACHE_HOST: cache
CACHE_PASSWORD:
CACHE_PORT: 6379

# DB connection info
DB_HOST: database
DB_PORT: 3306
DB_NAME: pantheon
DB_PASSWORD: pantheon
DB_USER: pantheon

# Index connection info
PANTHEON_INDEX_HOST: index
PANTHEON_INDEX_PORT: 449

# WordPress things
AUTH_KEY: Needed for Wordpress. We set this automatically.
AUTH_SALT: Needed for Wordpress. We set this automatically.
LOGGED_IN_KEY: Needed for Wordpress. We set this automatically.
LOGGED_IN_SALT: Needed for Wordpress. We set this automatically.
NONCE_KEY: Needed for Wordpress. We set this automatically.
NONCE_SALT: Needed for Wordpress. We set this automatically.
SECURE_AUTH_KEY: Needed for Wordpress. We set this automatically.
SECURE_AUTH_SALT: Needed for Wordpress. We set this automatically.

# Drupal/Backdrop things
BACKDROP_SETTINGS: JSON object of Backdrop config and settings.
PRESSFLOW_SETTINGS: JSON object of Drupal config and settings.
DRUPAL_HASH_SALT: Needed for Drupal8. We set this automatically.
```

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container.

Tooling
-------

Each Lando Pantheon recipe will also ship with the Pantheon toolchain. This means you can use `drush`, `wp-cli` and `terminus` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

> #### Warning::Tools are dependent on framework
>
> Lando will load up tools that are appropriate to the framework you specified in the recipe config section of your `.lando.yml`. eg. `wp-cli` will be available for WordPress sites and Drush will be available for Drupal sites.

```bash
# GEt to my app
cd /path/to/my/pantheon/app

# Login to terminus with a machine token
lando terminus auth:login --machine-token=MYSPECIALTOKEN

# Get a list of wp-cli commands
lando wp

# Download a dependency with drush
lando drush dl views

# Download a dependency with composer
lando composer config repositories.drupal composer https://packages.drupal.org/8
lando composer require "drupal/search_api_pantheon ~1.0" --prefer-dist

# Download a backdrop dependency
lando drush dl webform
```

You can also run `lando` from inside your app directory for a complete list of commands.

Advanced Service Usage
----------------------

Lando attempts to closely mimic the Pantheon environment. Please review the following docs to get a better handle on [how Pantheon works](https://pantheon.io/how-it-works):

*   [Pantheon Edge and Varnish](https://pantheon.io/docs/varnish/)
*   [Pantheon Index and Solr](https://pantheon.io/docs/solr/)
*   [Pantheon Caching and Redis](https://pantheon.io/docs/redis/)

What works on Pantheon **should** also work on Lando.

You can get more in-depth information about the services this recipe provides by running `lando info`.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "appserver": {
    "type": "php",
    "version": "7.0",
    "via": "nginx:1.8",
    "webroot": "web",
    "config": {
      "server": "/Users/pirog/.lando/services/config/pantheon/drupal.conf",
      "conf": "/Users/pirog/.lando/services/config/pantheon/php.ini"
    }
  },
  "nginx": {
    "urls": [
      "https://localhost:33091",
      "http://localhost:33092"
    ]
  },
  "database": {
    "type": "mariadb",
    "version": "10.0",
    "creds": {
      "user": "pantheon",
      "password": "pantheon",
      "database": "pantheon"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": "33088"
    },
    "config": {
      "confd": "/Users/pirog/.lando/services/config/pantheon/mysql"
    }
  },
  "cache": {
    "type": "redis",
    "version": "2.8",
    "internal_connection": {
      "host": "cache",
      "port": 6379
    },
    "external_connection": {
      "host": "localhost",
      "port": "33090"
    }
  },
  "edge_ssl": {
    "urls": [
      "https://localhost:33094",
      "https://pantheon.lndo.site"
    ]
  },
  "edge": {
    "type": "varnish",
    "version": "4.1",
    "vcl": "/Users/pirog/.lando/services/config/pantheon/pantheon.vcl",
    "backends": [
      "nginx"
    ],
    "urls": [
      "http://localhost:33093",
      "http://pantheon.lndo.site"
    ]
  },
  "index": {
    "type": "solr",
    "version": "custom",
    "internal_connection": {
      "core": "index1",
      "host": "index",
      "port": 449
    },
    "external_connection": {
      "core": "index1",
      "host": "localhost",
      "port": "not forwarded"
    }
  },
  "node": {
    "type": "node",
    "version": "6.10"
  }
}
```
