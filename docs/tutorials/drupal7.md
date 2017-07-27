Working with Pantheon
=====================





. Recipe config?



Lando offers a [recipe](./../recipes/pantheon.md) for spinning up apps that closely mimic the [Pantheon](http://pantheon.io) environment. Let's go over some basic usage. You should also check out Pantheon's [local dev](https://pantheon.io/docs/local-development/) docs.

Pull from Pantheon or GitHub
----------------------------

While you can clone down any repo and [manually configure](./../recipes/pantheon.md) a `.lando.yml` file for your Pantheon site Lando provides a `lando init` command so that you can easily pull a site from Pantheon or GitHub. **AT THIS TIME WE WILL NOT AUTOMATICALLY PULL YOUR DATABASE AND FILES** but you can read below on how to do that manually.

If you do not already have a Pantheon [machine token](https://pantheon.io/docs/machine-tokens/) we suggest you [create one](https://pantheon.io/docs/machine-tokens/). If you are pulling from GitHub we recommend you [generate a personal access token](./../cli/init.md#github) as well.

```bash
# Pull and init site from Pantheon
lando init myapp pantheon

# Or pull from github
lando init myapp github --recipe pantheon

# Commit the `.lando.yml` file to your repo
git add .
git commit -m "You look absolutely beautiful"

# Start the Pantheon app
# If you have a composer.json Lando will automatically run composer install
lando start
```

### .lando.yml

```yml
name: workflow
recipe: pantheon
config:
  framework: drupal
  xdebug: true
  id: 0d4eedc2-183e-4d80-8f00-9c9720b5c816
  site: drupal-7-pantheon-basicz
  env: dev
services:
  node:
    type: node:6.10
tooling:
  node:
    service: node
  npm:
    service: node
```

Authenticate with Terminus
--------------------------

If you used `lando init` to set up your Pantheon site you should already be authenticated.

```bash
lando terminus auth:whoami
```

If you did not you can authenticate manually. You will need a Pantheon [machine token](https://pantheon.io/docs/machine-tokens/) for this.

```bash
# Authenticate with terminus
lando terminus auth:login --machine-token=MYTOKEN

# Verify authentication
lando terminus auth:whoami

# Optionally pull down drush aliases
lando terminus aliases

# Verify we have some aliases
lando drush sa
```

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
