Working with Pantheon
=====================

Lando offers a [configurable recipe](./../recipes/pantheon.md) for spinning up apps that closely mimic the [Pantheon](http://pantheon.io) environment. Let's go over some basic usage.

You should also check out Pantheon's [local dev](https://pantheon.io/docs/local-development/) docs.

 <!-- toc -->

Getting Started
---------------

Before you can use all the awesome Lando magic you need a codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### Option 1. Start a codebase that already has a `.lando.yml`

```bash
# Clone pantheon codebase from git
# See: https://pantheon.io/docs/git/
git clone ssh://codeserver.dev.PANTHEONID@codeserver.dev.PANTHEONIDdrush.in:2222/~/repository.git mysite

# Go into the cloned site
cd mysite

# Start the site
lando start

# Authorize with pantheon
# NOTE: if you dont do this step you wont be able to do `lando pull/push/switch`
# NOTE: you need to put in the actual machine-token here, not the email
lando terminus auth:login --machine-token=MYSPECIALTOKEN
```

### Option 2. Init a codebase that doesn't yet have a `.lando.yml`

```bash
# Clone a codebase from some git repo
git clone /path/to/git/repo mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
# NOTE: You will need to choose the pantheon site that makes sense
lando init --recipe pantheon
```

### Option 3. Get your site from Pantheon

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Pantheon .lando.yml after getting code from Pantheon
# This require a Pantheon Machine Token
# See: https://docs.devwithlando.io/cli/init.html#pantheon
lando init pantheon
```

### Option 4. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite && cd mysite

# Initialize a Pantheon .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.devwithlando.io/cli/init.html#github
lando init github --recipe pantheon
```

Once you've initialized the `.lando.yml` file for your app you should commit it to your repository. This will allow you to forgo the `lando init` step in subsequent clones.

Starting Your Site
------------------

Once you've completed the above you should be able to start your Pantheon site.

**AT THIS TIME WE WILL NOT AUTOMATICALLY PULL YOUR DATABASE AND FILES**

You can read below on how to do that with our helper `pull` command or via a manual import.

If your Pantheon site has a `composer.json` Lando will attempt to run `composer install` on it automatically.

```bash
lando start
```

If you visit any of the green-listed URLs that show up afterwards you should be welcomed with the Drupal, Backdrop or WordPress installation screens. Read below on how to import your database and file so you can visit your site like it exists on Pantheon.

Importing Your Database and Files
---------------------------------

Once you've started up your Pantheon site you will need to pull in your database and files before you can really start to dev all the dev. There are two easy ways to do this...

### 1. Using `lando pull`

Lando provides a command for Pantheon sites called `lando pull` to get your database and files. **If you do not specify `--code`, `--database` or `--files` then `lando` will use the environment associated with your currently checked out `git branch`.**

On a database pull Lando will attempt to clear the cache of the remote environment (unless it is the live environment) to minimize the size of the import.

Please consult the manual import documentation below if this command produces an error.

#### Usage

```bash
# Pull the latest code, database and files
# This will pull the environment associated with your currently checked out git branch
lando pull

# Skip a code merge
lando pull --code=none

# Pull only the database from the test environment
lando pull --database=test --files=none

# Pull only the files
lando pull --database=none

# Pull only the latest files without grabbing a files backup
lando pull --database=none --rsync
```

#### Options

```bash
--code, -c      The environment to get the code from or [none]
--database, -d  The environment to get the db from or [none]
--files, -f     The environment to get the files from or [none]
--rsync         Rsync the files, good for subsequent pulls                                                  [boolean] [default: false]
```

### 2. Manually Importing Your DB and Files

You will want to the replace `MYSITE` and `MYENV` below with the Pantheon site and environment from which you want to import.

#### Database

```bash
# Remove lingering DB dumps
lando ssh -c "rm -f /app/database.sql.gz"

# Create a new backup of your database
# If you've created a db backup recently this step is not needed.
lando terminus backup:create MYSITE.MYENV --element=db

# Download and import backup of the database
lando terminus backup:get MYSITE.MYENV --element=db --to=/app/database.sql.gz
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./db-import.md)

#### Files

```bash
# Remove the DB dump
lando ssh -c "rm -f /tmp/files.sql.gz"

# Create a new backup of your files
# If you've created a files backup recently this step is not needed.
lando terminus backup:create MYSITE.MYENV --element=files

# Download and extract backup of the files
lando terminus backup:get MYSITE.MYENV --element=files --to=/tmp/files.tar.gz
lando ssh -c "mkdir -p \$LANDO_WEBROOT/\$FILEMOUNT"
lando ssh -c "tar -xzvf /tmp/files.tar.gz -C \$LANDO_WEBROOT/\$FILEMOUNT --strip-components 1"
```

You can alternatively download the backup and manually extract it to the correct location.

Pushing Your Changes
--------------------

While a best practices workflow suggests you put all your changes in code and push those changes with `git`, Lando provides a utility comand for `pantheon` recipes called `lando push` that pushes up any code, database or files changes you have made locally. **By default we set `--database` or `--files` to `none` since this is the suggested best practice**.

### Usage

```bash
# Push the latest code, database and files
# This will push the environment associated with your currently checked out git branch
lando push

# Push the latest code, database and files with a description of the change
lando push -m "Updated the widget to do awesome thing x"

# Push only the database and code
lando push --files=none

# Pull only the files and code
lando push --database=none
```

### Options

```bash
--message, -m   A message describing your change [default: "My awesome Lando-based changes"]
--database, -d  The environment to push the db to or [none]
--files, -f     The environment to push the files to or [none]
```

Working With Multidev
---------------------

Pantheon [multidev](https://pantheon.io/docs/multidev/) is a great (and easy) way to kickstart an advanced dev workflow for teams. By default `lando` will pull down your `dev` environment but you can use `lando switch <env>` to switch your local copy over to a Pantheon multidev environment.

### Usage

```bash
# Switch to the env called "feature-1"
lando switch feature-1

# Swtich to the env called "feature-1" but ignore grabbing that env's files and database
# Note that this is basically a glorified `get fetch --all && git checkout BRANCH`
lando switch feature-1 --no-db --no-files
```

### Options

```bash
  --no-db     Do not switch the database              [boolean] [default: false]
  --no-files  Do not switch the files                 [boolean] [default: false]
```

Tooling
-------

Each Lando Pantheon recipe will also ship with the Pantheon toolchain. This means you can use `drush`, `wp-cli` and `terminus` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer                 Run composer commands
lando db-import <file>         Import <file> into database. File is relative to approot.
lando db-export                Export a database. Resulting file: {DB_NAME}.TIMESTAMP.gz
lando drush                    Run drush commands
lando mysql                    Drop into a MySQL shell
lando php                      Run php commands
lando pull                     Pull code, database and/or files from Pantheon
lando push                     Push code, database and/or files to Pantheon
lando redis-cli                Run redis-cli commands
lando switch <env>             Switch to a different multidev environment
lando terminus                 Run terminus commands
lando varnishadm               Run varnishadm commands
lando wp                       Run wp-cli commands
```

> #### Warning::Tools are dependent on framework
>
> Lando will load up tools that are appropriate to the framework you specified in the recipe config section of your `.lando.yml`. eg. `wp-cli` will be available for WordPress sites and Drush will be available for Drupal sites.

```bash
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

Drush URL Setup
---------------

To set up your environment so that commands like `lando drush uli` return the proper URL, you will need to configure Drush.

**Drupal 7**

Create or edit `/sites/default/settings.local.php` and add these lines:

```
// Set the base URL for the Drupal site.
$base_url = "http://mysite.lndo.site"
```

**Drupal 8**

Create or edit `/sites/default/drushrc.php` and add these lines:

```
<?php
$options['uri'] = "http://mysite.lndo.site";
```

Configuration
-------------

### Recipe

You can also manually configure the `.lando.yml` file.

{% codesnippet "./../examples/pantheon/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/pantheon).

### pantheon.yml

If you want to [change your php version](https://pantheon.io/docs/php-versions/) or make use of a [nested docroot](https://pantheon.io/docs/nested-docroot/), you will want to do that in your [`pantheon.yml`](https://pantheon.io/docs/pantheon-yml/) file just like you would on Pantheon itself. Note that Lando will support both `pantheon.upstream.yml` and `pantheon.yml`.

{% codesnippet "./../examples/pantheon/pantheon.yml" %}{% endcodesnippet %}

A `lando restart` or `lando rebuild` is needed to apply these changes.

### Environment Variables

Like Pantheon, Lando will also [inject variables](https://pantheon.io/docs/read-environment-config/) into your runtime container so that you have useful information stored about your app. These are stored directly in the environment (eg accessible via [`getenv()`](http://php.net/manual/en/function.getenv.php)), `$_ENV`, `$_SERVER` or as defined `php` constants.

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

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. Note that these can vary based on the choices you make in your recipe config.

### Automation

You can take advantage of Lando's [events framework](./../config/events.md) to automate common tasks. Here are some useful examples you can drop in your `.lando.yml` to make your Pantheon app super slick.

Note that these suggestions are framework specific and that you can only define each event hook once, unlike below.

```yml
events:

  # Runs composer install and npm install/npm compile-sass after you start
  # NOTE: this assume you've set up a node cli container called `node` with `gulp`
  # installed globally and a sass compile task called `gulp sass`
  post-start:
    - appserver: cd $LANDO_MOUNT && composer install
    - node: cd $LANDO_WEBROOT/path/to/theme && npm install
    - node: cd $LANDO_WEBROOT/path/to/theme && gulp sass

  # Runs wp search-replace after you do a pull
  post-pull:
    - appserver: wp search-replace OLDURL NEWURL

  # Does a features revert clear cache after a pull
  post-pull:
    - appserver: cd $LANDO_WEBROOT && drush fra -y
    - appserver: cd $LANDO_WEBROOT && drush cc all -y

  # Does a config import clear cache after a pull
  post-pull:
    - appserver: cd $LANDO_WEBROOT && drush config-import -y
    - appserver: cd $LANDO_WEBROOT && drush cr

  # Does a config export before a push
  pre-push:
    - appserver: cd $LANDO_WEBROOT && drush config-export -y

  # Clears the remote sites cache and updates its db after a push
  post-push:
    - appserver: drush @pantheon.MYSITE.MYENV drush updb -y
    - appserver: drush @pantheon.MYSITE.MYENV drush cr
```

Advanced Service Usage
----------------------

Lando attempts to closely mimic the Pantheon environment. Please review the following docs to get a better handle on [how Pantheon works](https://pantheon.io/how-it-works):

*   [Pantheon Edge and Varnish](https://pantheon.io/docs/varnish/)
*   [Pantheon Index and Solr](https://pantheon.io/docs/solr/)
*   [Pantheon Caching and Redis](https://pantheon.io/docs/redis/)

You can get more in-depth information about the services this recipe provides by running `lando info`.

What works on Pantheon **should** also work on Lando.

External Libraries
------------------

Lando also supports the same [external libraries](https://pantheon.io/docs/external-libraries/) as Pantheon so you can use Lando to test code that uses `phantomjs`, `wkhtmltopdf`, `tika` and more.

If you'd like to utilize these libraries as outside-the-container command line tools then either add or augment the `tooling` section of your `.lando.yml` with:

```yaml
tooling:
  node:
    service: node
  npm:
    service: node
  phantomjs:
    service: appserver
    cmd: /srv/bin/phantomjs
  wkhtmltopdf:
    service: appserver
    cmd: /srv/bin/wkhtmltopdf
  tika:
    service: appserver
    cmd: java -jar /srv/bin/tika-app-1.1.jar
```

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
