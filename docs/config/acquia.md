---
description: The best local development option for Drupal 7, Drupal 8 or WordPress sites running on Acquia. Get Acquia CLI and all the usual power tools plus awesome workflow automation.
---

# Acquia (alpha)

[Acquia](https://www.acquia.com/) is the Enterprise Digital Experience Platform designed to help you build Drupal experiences that engage customers, enhance conversions and help your business stand out.

Lando provides a snazzy integration that:

* Closely mimics Acquia's stack, versions and environment locally
* Allows you to easily `pull` your Acquia site down locally
* Allows you to easily `push` your changes back to Acquia
* Installs `drush`, `acli` and other power tools.

However, in order to profit, **you must** have an account and a site on Acquia to be able to use this recipe. If you don't, you can sign up [here](https://accounts.acquia.com/sign-up?path=&site=cloud).

[[toc]]

## Getting Started

::: warning ALPHA VERSION!
This recipe is currently in `alpha`. This means it is mostly feature complete but not currently tested against a large cross section of projects. As a result YMMV. Also note that you must have Lando version `3.0.27` or higher to try this out.
:::

Before you get started with this recipe, we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familiar with [its basics](./../basics/).
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe.
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM), you can also try out this recipe with an extant Acquia project or start a brand new project on Acquia with the commands as follows:

```bash
# Toggle the experimental flag to gain access to alpha features
lando --experimental

# Go through interactive prompts to get your code from acquia
lando init --source acquia

# OR if you already have your acquia code locally
cd /path/to/repo
lando init \
  --source cwd \
  --recipe acquia

# Start it up
lando start

# Import your database and files
lando pull

# List information about this app.
lando info
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box, they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe. If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: acquia
config:
  acli_version: latest
  ah_application_uuid: null
  ah_site_group: null
  build:
    run_scripts: true
  cache: true
  composer_version: '2'
  inbox: true
  php: '7.4'
  xdebug: false
```

If you do not already have a [Landofile](./../config/lando.md) for your Acquia site, we highly recommend you use [`lando init`](./../basics/init.md) to get one as that will automatically populate the `ah_application_uuid`, `ah_site_group` and `php` version for you. Manually creating a Landofile with these things set correctly can be difficult and is *highly discouraged.*

Note that if the above config options are not enough, all Lando recipes can be further [extended and overridden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a composer version

By default the `acquia` recipe will default to the latest stable release of `composer` 2. If your application depends on a different version of composer you can set `composer_version` to any version that is available in our [php service](./php.md#installing-composer).

```yaml
recipe: acquia
config:
  composer_version: '1.10.1'
```

### Disabling `acli pull:run-scripts`

By default `acli pull:run-scripts` will automatically run on your first `lando start` and on subsequent `lando rebuilds` to ensure your site has the needed code dependencies to run correctly. However, there are some _rare_ situations where this may not be a suitable default. In such cases you can disable this behavior:

```yaml
recipe: acquia
config:
  build:
    run_scripts: false
```

### Customizing the stack

By default, Lando will spin up an approximation of the Acquia stack:

* Apache webserver `2.4`
* MySQL database server `5.7`
* Memcache `1.6`
* PHP `7.3`, `7.4`

Not current supported but coming soon:

* Solr `3`, `4`, `7`

Additionally Lando will provide a configurable `mailhog` service so that you can catch an inspect outgoing mail locally.

This means that what works on Acquia **should** also work on Lando. Please recognize, however, that the Acquia platform is changing all the time and Lando is necessarily reactive in some cases.

If you do not need the umlimited power of a fully armed and operational Acquia stack you can tell Lando to *not use* the more advanced parts of Acquia's stack. This can save time when starting up your app.

```yaml
recipe: acquia
config:
  # Disable the MEMCACHE cache
  cache: false

  # Disable the MAILHOG inbox
  inbox: false
```

Note that if your application code depends on one of these services and you disable them, you should expect an error. Also note that Lando does not track what services you are using on your Acquia site e.g. these settings are "decoupled".

### Using acli

While in `alpha` Lando ships the `acli` built from the latest commit to `master` on GitHub. You can change this behavior in a few ways:

1. Install latest stable release

```yaml
recipe: acquia
config:
  acli_version: latest
```

2. Install a specific release version

```yaml
recipe: acquia
config:
  acli_version: "1.8.1"
```

### Using xdebug

This is just a passthrough option to the [xdebug setting](./php.md#toggling-xdebug) that exists on all our [php services](./php.md). The `tl;dr` is `xdebug: true` enables and configures the php xdebug extension and `xdebug: false` disables it.

```yaml
recipe: acquia
config:
  xdebug: true|false
```

However, for more information, we recommend you consult the [php service documentation](./php.md).

## Connecting to your database

Just like on Acquia, Lando will automatically configure your application to connect to its local database and cache. Note that in some cases, such as when the user has purposefully removed the sourcing of the `${project}-settings.inc` file, this will not work.

If you find yourself in this situation and need to manually connect to the database or cache credentials for each are below:

Note that the `host` is not `localhost` but `database` and `cache` for `mysql` and `memcache` respectively.

```yaml
# Database
database: acquia
username: acquia
password: acquia
host: database
port: 3306

# Cache
host: cache
port: 11211
```

You can get also get the above information, and more, by using the [`lando info`](./../cli/info.md) command or you can check out the environment variable called [`LANDO INFO`](./../guides/lando-info.md) as it contains useful information about how your application can access other Lando services.

## Importing Your Database and Files

Once you've started up your Acquia site you will need to pull in your database and files before you can really start to dev that sweet sweet dev. There are two easy ways to do this as shown below:

### 1. Using `lando pull`

Lando provides a command for Acquia sites called `lando pull` to get your database and files.

Note that if Lando cannot find an [Acquia API key](https://docs.acquia.com/cloud-platform/develop/api/auth/) associated with your local site, it will prompt you to enter one. You can also switch to a different key by using the  `--key` and `--secret` options.

#### Usage

```bash
# Pull the latest code, database and files
lando pull

# Skip a code merge
lando pull --code=none

# Pull only the database from the dev environment
lando pull --code=none --database=dev --files=none

# Attempt a pull using a different key and secret
lando pull --key "$ACQUIA_KEY" --secret "$ACQUIA_SECRET"
```

#### Options

```bash
--verbose, -v   Runs with extra verbosity
--code, -c      The environment from which to pull the code
--database, -d  The environment from which to pull the database
--files, -f     The environment from which to pull the files
--key           An Acquia API key
--secret        An Acquia API secret
```

Please consult the manual import documentation below if this command produces an error.

### 2. Manually Importing Your DB and Files

In the event that `lando pull` is not working as expected you have a few other things you can try out to grab your database and files.

#### Database

```bash
# Use the ACLI directly
lando acli pull:db

# Download and import a database backup
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./../guides/db-import.md).

#### Files

```bash
# Use the ACLI directly
lando acli pull:files
```

## Pushing Your Changes

While a best practices workflow suggests you put all your changes in code and push those changes with `git`, Lando provides a utility command for `acquia` recipes called `lando push` that pushes up any code, database or files changes you have made locally.

**By default, we set `--database` or `--files` to `none` since this is the suggested best practice**.

Note again that if Lando cannot find an [Acquia API key](https://docs.acquia.com/cloud-platform/develop/api/auth/) associated with your local site, it will prompt you to enter one. You can also switch to a different key by using the  `--key` and `--secret` options.

### Usage

```bash
# Push the latest code, database and files
lando push
```

### Options

```bash
--verbose, -v   Runs with extra verbosity
--code, -c      The environment from which to pull the code
--database, -d  The environment from which to pull the database
--files, -f     The environment from which to pull the files
--key           An Acquia API key
--secret        An Acquia API secret
```

## Tooling

Each Lando Acquia recipe will also ship with the Acquia toolchain. This means you can use `drush` and `acli` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando acli              Runs acli commands
lando composer          Runs composer commands
lando db-export [file]  Exports database from a database service to a file
lando db-import <file>  Imports a dump file into a database service
lando drush             Runs drush commands
lando mysql             Drops into a MySQL shell on a database service
lando php               Runs php commands
lando pull              Pull code, database and/or files from acquia
lando push              Push code, database and/or files to acquia
lando switch            Switch to a different multidev environment
lando version           Displays the lando version
```

```bash
# Login to acquia
lando acli auth:login

# Clear drush caches
lando drush cr

# Download a dependency with composer
lando composer config repositories.drupal composer https://packages.drupal.org/8
lando composer require "drupal/search_api_acquia ~1.0" --prefer-dist
```

<RelatedGuides tag="acquia"/>
