---
description: The best local development environment option for Platform.sh, the fastest way to build modern web apps.
---

# Platform.sh **(beta)**

[Platform.sh](https://platform.sh/) is the end-to-end web platform for agile teams. With it you can build, evolve, and scale your website fleet—with zero infrastructure management investment. Get hosting, CI/CD, automated updates, global 24x7 support. And much more.

This integration is currently in development and as such it has the following _serious caveats_:

* This should be considered at an `beta` level of readiness
* This has only been tested against Platform.sh's `php` project templates
* This currently _only_ supports Platform.sh's `php` application container
* It's not yet clear how much customization to your project is currently supported

However, if you'd like to try it out and give your feedback on what worked and what didn't then please continue. You can also read about some more caveats [here](#caveats-and-known-issues).

You can report any issues or feedback [over here](https://github.com/lando/lando/issues/new/choose) or check out

[[toc]]

## Getting Started

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familiar with [its basics](./../basics/)
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM), you can also run the following commands to try out this recipe on one of your Platform.sh sites.

```bash
# Go through interactive prompts to get your site from platformsh
lando init --source platformsh

# OR do it non-interactively
# NOTE: You will want to make sure you set $PLATFORMSH_CLI_TOKEN
# and $PLATFORMSH_SITE_NAME to values that make sense for you
lando init \
  --source platformsh \
  --platformsh-auth "$PLATFORMSH_CLI_TOKEN" \
  --platformsh-site "$PLATFORMSH_SITE_NAME"


# OR if you already have your platform code locally
cd /path/to/repo
lando init \
  --source cwd \
  --recipe platformsh

# Start it up
lando start

# Import any relevant relationships or mounts
# NOTE: You will likely need to change the below to specify
# relationships and mounts that make sense for your application
# See further below for more information about lando pull
lando pull -r database -m web/sites/default/files

# List information about this app.
lando info
```

**Note that if your `platformsh` project requires environment variables set in the [Platform Management Console](https://docs.platform.sh/administration/web/configure-environment.html#settings) you will need to set those manually!** See the [Environment Variables](#environment-variables) section below for details.

## Configuration

While Lando [recipes](./../config/recipes.md) sets sane defaults so they work out of the box, they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe's [Landofile](./../config/lando.md). If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: platformsh
config:
  id: YOURSITEID
  overrides: {}
```

You will immediately notice that the default `platformsh` recipe Landofile does not contain much. This is because Lando uses the exact same images and configuration mechanisms locally as Platform.sh does in production.

This means that instead of modifying your Landofile to add, edit or remove the services, dependencies, build steps, etc you need to run your application you will want to modify your Platform.sh configuration according to their documentation and then do the usual `lando rebuild` for those changes to be applied.

Of course, since this is still a Lando recipe you can continue to [extend and override](./../config/recipes.md#extending-and-overriding-recipes) your Landofile in the usual way for any additional power you require locally.

Here are some details on how Lando interprets the various Platform.sh configuration files:

### routes.yaml

Lando will load your [routes.yaml](https://docs.platform.sh/configuration/routes.html) and use for its own [proxy](./proxy.md) configuration.

```yaml
# routes.yaml

"https://{default}/":
  type: upstream
  upstream: "app:http"
  cache:
    enabled: true
    # Base the cache on the session cookie and custom Drupal cookies. Ignore all other cookies.
    cookies: ['/^SS?ESS/', '/^Drupal.visitor/']

"https://www.{default}/":
  type: redirect
  to: "https://{default}/"
```

The above `routes` configuration example will produce the following Lando pretty proxy URLs, assuming `{default}` resolves to `my-app.lndo.site`.

```bash
http://my-app.lndo.site
https://my-app.lndo.site
http://www.my-app.lndo.site
https://www.my-app.lndo.site
```

Note, however, that Lando will **only** use routes that contain the `{default}` placeholder. FQDN routes will not be used since these generally will be pointing at your production site and not Lando. If you would still like to use these routes then we recommend you review our [proxy](./proxy.md) docs on how to add them back into the mix.

### services.yaml

Lando will load your [services.yaml](https://docs.platform.sh/configuration/services.html) and spin up _exactly_ the same things there as you have running on your Platform.sh site, including any advanced configuration options you may have specified for each like `schemas`, `endpoints`, `extensions`, `properties`, etc.

This means that Lando knows how to handle more complex configuration such as in the below example:

```yaml
# services.yaml

db:
  type: mariadb:10.4
  disk: 2048
  configuration:
    schemas:
      - main
      - legacy
    endpoints:
      admin:
        default_schema: main
        privileges:
          main: admin
          legacy: admin
db2:
  type: postgresql:12
  disk: 1025
  configuration:
    extensions:
      - pg_trgm
      - hstore
```

We currently only support the below services and we _highly recommend_ you consult the Platform.sh docs for how to properly configure each.

* [Elasticsearch](https://docs.platform.sh/configuration/services/elasticsearch.html)
* [Headless Chrome](https://docs.platform.sh/configuration/services/headless-chrome.html)
* [InfluxDB](https://docs.platform.sh/configuration/services/influxdb.html)
* [Kafka](https://docs.platform.sh/configuration/services/kafka.html)
* [MariaDB/MySQL](https://docs.platform.sh/configuration/services/mysql.html)
* [Memcached](https://docs.platform.sh/configuration/services/memcached.html)
* [MongoDB](https://docs.platform.sh/configuration/services/mongodb.html)
* [PostgreSQL](https://docs.platform.sh/configuration/services/postgresql.html)
* [RabbitMQ](https://docs.platform.sh/configuration/services/rabbitmq.html)
* [Redis](https://docs.platform.sh/configuration/services/redis.html)
* [Solr](https://docs.platform.sh/configuration/services/solr.html)
* [Varnish](https://docs.platform.sh/configuration/services/varnish.html)

Also note that you will need to run a `lando rebuild` for configuration changes to manifest in the same way you normally would for config changes to your Landofile.

### .platform.app.yaml

Lando will load your [.platform.app.yaml](https://docs.platform.sh/configuration/app.html) and spin up _exactly_ the same things there as you have running on your Platform.sh site. This means that similarly to Platform.sh Lando will also:

* Install any dependencies specificed in the `build.flavor` or `dependencies` keys
* Run any `build` or `deploy` hooks
* Set up needed `relationships`, `variables`, `web` config, `cron` tasks, etc.

We currently only support the below langauges and we _highly recommend_ you consult the Platform.sh docs for how to properly configure each.

* [PHP](https://docs.platform.sh/languages/php.html)

Also note that you will need to run a `lando rebuild` for configuration changes to manifest in the same way you normally would for config changes to your Landofile.

### Multiple applications

Lando _should_ support Platform.sh's [multiple applications configurations](https://docs.platform.sh/configuration/app/multi-app.html) although they are not extensively tested at this point so YMMV.

If you have a multiple application setup then you will need to navigate into either the directory that contains the `.platform.app.yaml`  or the `source.root` specified in your `.platform/applications.yaml` file to access the relevant tooling for that app.

This is how tooling works for our [multiapp example](https://github.com/lando/lando/tree/master/examples/platformsh-kitchensink).

```bash
# Get access to tooling for the "base" application
lando

# Access tooling for the "discreet" application
cd discreet
lando

# Access tooling for the "php" application
cd ../php
lando
```

### Environment

Application containers running on Lando will also set up the same [PLATFORM_* provided environment variables](https://docs.platform.sh/development/variables.html#platformsh-provided-variables) so any service connection configuration, like connecting your Drupal site to `mysql` or `redis`, you use on Platform.sh with these variables _should_ also automatically work on Lando.

Lando _does not_ currently pull variables you have set up in the Platform.sh dashboard so you will need to add those manually.

### Overriding config

Platform.sh application language and service configuration is generally optimized for production. While these values are usually also suitable for local development purposes Lando also provides a mechanism to override _both_ application language and service configuration with values that make more sense for local.

```yaml
name: myproject
recipe: platformsh
config:
  id: PROJECTID
  overrides:
    app:
      variables:
        env:
          APP_ENV: dev
        d8settings:
          skip_permissions_hardening: 1
    db:
      configuration:
        properties:
          max_allowed_packet: 63
```

Note that `app` in the above example should correspond to the `name` of the Platform.sh application you want to override and `db` should correspond to the `name` of one of the services in your `services.yaml.` Also note that you will need to `lando rebuild` for this changes to apply.

## Environment variables

Lando will also set and honor any [variables](https://docs.platform.sh/configuration/app/variables.html) that have been set up in your `.platform.app.yaml` or `applications.yaml`.

However, some of these, such as `APP_ENV=prod` do not make a ton of sense for local development. In these situations you can override _any_ Platform.sh variable directly from your Landofile with values that make more sense for local. Here is an example:

```yaml
name: platformsh-drupal8
recipe: platformsh
config:
  id: PROJECTID
  overrides:
    app:
      variables:
        env:
          APP_ENV: dev
        d8settings:
          skip_permissions_hardening: 1
```

Perhaps more importantly, Lando **will not** automatically pull and set up environment variables that have been set in the [Platform Management Console](https://docs.platform.sh/administration/web/configure-environment.html#variables). This means that if your build hook requires these environment variables then it will likely fail.

To remediate we recommend you manually add these variables into a local [environment file](./../config/env.html#environment-files) that is also in your `.gitignore` and then `lando rebuild`. Here are some steps on how to do that.

1. Update your Landofile so it knows to load an environment file.

```yaml
env_file:
  - platformsh.local.env
```

2. **Make sure** you add it to your `.gitignore` file.

```
platformsh.local.env
```

3. Create the env file

```bash
touch platformsh.local.env
```

4. Discover envvars by running `lando platform var`
5. Use the information from above to populate `platformsh.local.env`

```bash
SPECIAL_KEY=mysecret
```

6. Run `lando rebuild` to trigger the build process using the newly added envvars.

## Platform CLI

Every application container will contain the [Platform.sh CLI](https://docs.platform.sh/development/cli.html); automatically authenticated for use with the account and project you selected during `lando init`.

```bash
# Who am i?
lando platform auth:info

# Tell me about my project
lando platform project:info
```

If you find yourself unauthenticated for whatever reason. You should try the following:

```bash
# Reauthenticate using already pulled down code
lando init --source cwd --recipe platformsh

# Rebuild your lando app
lando rebuild -y
```

## Application Tooling

Lando will also setup useful [tooling commands](./tooling.md) based on the `type` of your application container.

These can be used to both relevant tooling and utilities that exist _inside_ the application container. Here are the defaults we provide for the `php` application container.

```bash
lando composer    Runs composer commands
lando php         Runs php commands
```

### Usage

```bash
# Install some composer things
lando composer require drush/drush

# Run a php script
lando php myscript.php
```

Of course the user can also `lando ssh` and work directly inside _any_ of the containers Lando spins up for your app.

```bash
# Attach to the closest applicaiton container
lando ssh

# Attach to the db service
lando ssh -s db
```

Note that Lando will surface commands for the _closest application_ it finds. Generally, this will be the `.platform.app.yaml` located in your project root but if you've `cd multiappsubdir` then it will use that instead.

### Adding additional tooling

While Lando will set up tooling routes for the _obvious_ utilities for each application `type` it tries to not overwhelm the user with _all the commands_ by providing a minimally useful set. It does this because it is very easy to specify more tooling commands in your Landofile.

```yaml
tooling:
  # Here are some utilities that should exist in every application
  # container
  node:
    service: app
  npm:
    service: app
  ruby:
    service: app

  # And some utilities we installed in the `build.flavor`
  # or `dependencies` key
  grunt:
    service: app
  sass:
    service: app
  drush:
    service: app

```

Note that the `service` should match the `name` of your application in the associated `.platform.app.yaml`. Very often this is just `app`.

Now run `lando` again and see that extra commands!

```bash
lando composer      Runs composer commands
lando drush         Runs drush commands
lando grunt         Runs grunt commands
lando node          Runs node commands
lando npm           Runs npm commands
lando php           Runs php commands
lando ruby          Runs ruby commands
lando sass          Runs sass commands
```

```bash
lando drush cr
lando npm install
lando grunt compile:things
lando ruby -v
lando node myscript.js
```

If you are not sure whether something exists inside your application container or not you can easily test using the `-c` option provided by l`lando ssh`

```bash
# Does yarn exist?
lando ssh -c "yarn"
```

Also note that Lando tooling is hyper-powerful so you might want to [check out](./tooling.md) some of its more advanced features.


## Accessing relationships

Lando will also set up tooling commands so you can directly access the `relationships` specified in your `.platform.app.yaml`.

These are contextual so they will connect via the tool that makes the most sense eg `mysql` for `mariadb` and `redis-cli` for `redis`.

As an example say you have the following relationships in your `.platform.app.yaml`.

```yaml
relationships:
  database: 'db:mysql'
  redis: 'cache:redis'
```

Then you'd expect to see the following commands and usage:

```bash
lando database  Connects to the database relationship
lando redis     Connects to the database relationship
```

```bash
# Drop into the mysql shell using the database relationship creds
lando database

# Drop into the redis-cli shell using the redis relationship creds
lando redis
```

Note that some services eg `solr` provide `web` based interfaces. In these cases Lando will provide a `localhost` address you can use to access that interface.

## External access

If you would instead like to connect to your database, or some other service, from your host using a GUI client like SequelPro, instead of via the Lando CLI you can run [`lando info`](./../cli/info.md) and use the `external_connection` information and any relevant `creds` for the service you want to connect to.

Here is example connection info for a multi-endpoint `mariadb` service called `db` below:

```bash
lando info --service db --format default

  { service: 'db',
    urls: [],
    type: 'platformsh-mariadb',
    healthy: true,
    creds:
     [ { internal_hostname: 'database2.internal',
         password: '3ac01938c66f0ce06304a6357da17c34',
         path: 'main',
         port: 3306,
         user: 'admin' },
       { internal_hostname: 'reports.internal',
         password: 'd0c99f580a0d646d62904568573f5012',
         port: 3306,
         user: 'reporter' },
       { internal_hostname: 'imports.internal',
         password: 'a6bf5826a81f7e9a3fa42baa790207ef',
         path: 'legacy',
         port: 3306,
         user: 'importer' } ],
    internal_connection: { host: 'db', port: '3306' },
    external_connection: { host: '127.0.0.1', port: '32915' },
    config: {},
    version: '10.4',
    meUser: 'app',
    hasCerts: false,
    hostnames: [ 'db.landod8.internal' ] },
```

Note that you _must_ have a relationship from your app to a given service in order for it to have credentials.

Also note that this is slightly different than the normal output from `lando info` because `platformsh` services work slightly different. While you _can_ use the `internal_connection:host` and `internal_connection:port` for internal connections we recommend you use the `host` and `port` indicated for the relevant `cred` you want to connect to instead.

So if you wanted to connect to the `main` db you would use the following depending on whether you are connecting externally or internally:

**external creds**

```yaml
host: 127.0.0.1
port: 32915
user: admin
password: 3ac01938c66f0ce06304a6357da17c34
database: main
```

**internal creds**

```yaml
host: database2.internal
port: 3306
user: admin
password: 3ac01938c66f0ce06304a6357da17c34
database: main
```

Of course, it is always preferrable to just use `PLATFORM_RELATIONSHIPS` for all your internal connections anyway.

## Pulling and pushing relationships and mounts

Lando also provides wrapper commands called `lando pull` and `lando push`.

With `lando pull` you can import data and download files from your remote Platform.sh site. With `lando push` you can do the opposite, export data or upload files to your remote Platform.sh site. Note that only database relationships are currently syncable.

```bash
lando pull

Pull relationships and/or mounts from Platform.sh

Options:
  --help              Shows lando or delegated command help if applicable
  --verbose, -v       Runs with extra verbosity
  --auth              Platform.sh API token
  --mount, -m         A mount to download
  --relationship, -r  A relationship to import
```

```bash
# Interactively pull relationships and mounts
lando pull

# Import the remote database relationship and drupal files mount
lando pull -r database -m web/sites/default/files

# Import multiple relationships and mounts
lando pull -r database -r migrate -r readonly -m tmp -m private

# You can also specify a target for a given mount using -m SOURCE:TARGET
lando pull -m tmp:/var/www/tmp -m /private:/somewhere/else

# You can also specify a target db/schema for a given relationships using -r RELATIONSHIP:SCHEMA
lando pull -r admin:legacy

# Skip the mounts part
lando pull -r database -m none

# Effectively "do nothing"
lando pull -r none -m none
```

```bash
lando push

Push relationships and/or mounts to Platform.sh

Options:
  --help              Shows lando or delegated command help if applicable
  --verbose, -v       Runs with extra verbosity
  --auth              Platform.sh API token
  --mount, -m         A mount to push up
  --relationship, -r  A relationship to push up
```

```bash
# Interactively push relationships and mounts
lando push

# Import the remote database relationship and drupal files mount
lando push -r database -m web/sites/default/files

# Import multiple relationships and mounts
lando push -r database -r migrate -r readonly -m tmp -m private

# You can also specify a target for a given mount using -m SOURCE:TARGET
lando push -m tmp:/var/www/tmp -m /private:/somewhere/else

# You can also specify a target db/schema for a given relationships using -r RELATIONSHIP:SCHEMA
lando push -r admin:legacy -r admin:main

# Skip the relationships part
lando push -r none -m tmp

# Effectively "do nothing"
lando push -r none -m none
```

## Importing databases

If you have data that exists outside Platform.sh eg a `dump.sql` file you'd like to import you can leverage the special `lando` commands we give you to access each `relationship`. You will need to make sure that the relationship you connect with has the appropriate permissions needed to import your dump file.

```bash
# Import to the main schema using the database relationships
lando database main < dump.sql
```

## Caveats and known issues

Since this is a currently an `beta` release there are a few known issues, and workarounds, to be aware of. We also recommend you consult GitHub for other [Platform.sh tagged issues](https://github.com/lando/lando/issues?q=is%3Aopen+is%3Aissue+label%3Aplatformsh
).

We also _highly encourage_ you to [post an issue](https://github.com/lando/lando/issues/new/choose) if you see a problem that doesn't already have an issue.

### `$HOME` considerations

Platform.sh sets `$HOME` to `/app` by default. This makes sense in a read-only hosting context but is problematic for local development since this is also where your `git` repository lives and you probably don't want to accidentally commit your `$HOME/.composer` cache into your repo.

Lando changes this behavior and sets `$HOME` to its own default of `/var/www` for most _user initiated_ commands and automatic build steps.

It also will override any `PLATFORM_VARIABLES` that should be set differently for local dev. For a concrete example of this Platform.sh's Drupal 8 template will set the Drupal `/tmp` directory to `/app/tmp`, Lando will instead set this to `/tmp`.

However, it's _probable_ at this early stage that we have not caught all the places where we need to do both of the above. As a result you probably want to:

#### 1. Look out for caches, configs, or other files that might normally end up in `$HOME`.

Do you due diligence and make sure you `git status` before you `git add`. If you see something that shouldn't be there [let us know](https://github.com/lando/lando/issues/new/choose) and then add it to your `.gitignore` until we have resolved it.


#### 2. Consider LANDO specific configuration

If you notice your application is _not working quite right_ it's possible you need to tweak some of the defaults for your application's configuration so they are set differently on Lando. We recommend you do something like the below snippet.

`settings.local.php`

```php
$platformsh = new \Platformsh\ConfigReader\Config();

if ($config->environment === 'lando') {
  $settings['file_private_path'] = '/tmp';
  $config['system.file']['path']['temporary'] = '/tmp';
}

```

Note that the above is simply meant to be illustrative.

### Redirects

Lando will currently not perform redirects specified in your `routes.yaml`. Instead it will provide separate `http` and `https` routes.

Adding redirect support is being discussed in this ticket: <https://github.com/lando/lando/issues/2509>.

### Local considerations

There are some application settings and configuration that Platform.sh will automatically set if your project is based on one of their boilerplates. While most of these settings are fine for local development, some are not. If these settings need to be altered for your site to work as expected locally then Lando will modify them.

For example if your project is based on the [Drupal 8 Template](https://github.com/platformsh-templates/drupal8) then Lando will set the `tmp` directory and set `skip_permissions_hardening` to `TRUE`.

Lando will likely _not_ do this in the future in favor of a better solution but until then you can check out what we set over [here](https://github.com/lando/lando/blob/master/integrations/lando-platformsh/lib/overrides.js).

### Memory limits

Some services eg Elasticsearch require A LOT of memory to run. Sometimes this memory limit is above the defaults set by Docker Desktop. If you are trying to start an app with memory intensive services and it is hanging try to bump the resources allocated to Docker Desktop and try again. See the below docs:

* [Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/#resources)
* [Docker Desktop for Windows](https://docs.docker.com/docker-for-windows/#resources)

### Xdebug

You can enable and use xdebug by turning on the extension in your `.platform.app.yaml` and doing a `lando rebuild`.

```yaml
runtime:
  extensions:
    - redis
    - xdebug
```

Due to how Platform.sh sets up `xdebug` it should be ok to have this on even in production. However, if you would like to enable it _only_ on Lando you can override the extensions in your Landofile. Note that the entire array is replaced in the overrides so your Landofile should reflect _all_ the extensions you want to use not just the difference.

```yaml
recipe: platformsh
config:
  id: PROJECT_ID
  overrides:
    app:
      runtime:
        extensions:
          - redis
          - xdebug
```

Lando will also make a best effort attempt to set the correct `xdebug` configuration so that it works "out of the box". If you find that things are not working as expected you can modify the configuration to your liking using the same override mechanisn.


```yaml
config:
  id: PROJECT_ID
  overrides:
    app:
      runtime:
        extensions:
          - redis
          - xdebug
      php:
        # XDEBUG 2
        xdebug.remote_enable: 1
        xdebug.remote_mode: req
        xdebug.remote_port: 9000
        xdebug.remote_connect_back: 0

        # XDEBUG 3
        xdebug.discover_client_host: true
        xdebug.mode: debug
```

### Platformsh.agent errors

When you run `lando start` or `lando rebuild` you may experience either Lando hanging or an error being thrown by something called the `platformsh.agent`. We are attempting to track down the causes of some of these failures but they are generally easy to identify and workaround:

```bash
# Check if a container for your app has exited
docker ps -a

# Inspect the cause of the failure
#
# Change app to whatever you named your application
# in your .platform.app.yaml
lando logs -s app

# Try again
# Running lando start again seems to work around the error
lando start
```

### Persistence across rebuilds

We've currently only verified that data will persist across `lando rebuilds` for the MariaDB/MySQL and PostgreSQL services. It _may_ persist on other services but we have not tested this yet so be careful before you `lando rebuild` on other services.

### Multiapp

If you are using `.platform/applications.yaml` to configure multiple applications and you have two apps with the same `source.root` then Lando will currently use the _first_ application for tooling.

As a workaround you can use `lando ssh` with the `-s` option to access tooling for other applications with that `source.root`.

In the below example, assume there are three `php` applications with the same `source.route`.

```bash
# Go into a directory that has many apps with that same source.route
# See the php version of the first app with source.root at this directory
lando php -v

# Access another app with same source.root
lando -s app2 -c "php -v"
```

### Unsupported things

There are a few things that are currently unsupported at this time, athough we hope to add support in the future.

* Non `php` application containers. [#2368](https://github.com/lando/lando/issues/2368)
* `workers` and the `network_storage` service [#2393](https://github.com/lando/lando/issues/2393)

## Development

If you are interested in working on the development of this recipe we recommend you check out:

* The Lando [contrib docs](./../contrib/contributing.md)
* The [Dev Docs](https://github.com/lando/lando/tree/master/integrations/lando-platformsh) for this recipe

<RelatedGuides tag="Platformsh"/>
