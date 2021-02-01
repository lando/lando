---
description: The best local development option for Lagoon a Docker Build and Deploy System for OpenShift & Kubernetes
---

# Lagoon **(beta)**

[Lagoon](https://lagoon.readthedocs.io/en/latest/) solves what developers are dreaming about: A system that allows developers to locally develop their code and their services with Docker and run the exact same system in production. The same Docker images, the same service configurations and the same code.

This is currently an _beta_ level integration that has the following _serious caveats_:

* This _does not_ support Lagoon's `elasticsearch`, `mongodb`, or `rabbitmq` containers yet
* It's not yet clear how much customization to your project is currently supported

However, if you'd like to try it out and give your feedback on what worked and what didn't then please continue.

You can report any issues or feedback [over here](https://github.com/lando/lando/issues/new/choose).

[[toc]]

## Getting Started

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familiar with [its basics](./../basics/)
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.
4. Temporarily stopped (`pygmy stop`) the [Pygmy](https://pygmy.readthedocs.io/en/master/) tool to avoid any port conflicts

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM), you can also run the following commands to try out this recipe against the amazee.io [Drupal Example](https://github.com/amazeeio/drupal-example-simple).

```bash
# Clone a site from a lagoon instance
lando init --source lagoon

# Start it up
lando start

# Pull down files and database
lando pull --database main --files main

# List information about this apps services.
lando info
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box, they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe's [Landofile](./../config/lando.md). If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: lagoon
config:
  build:
    - composer install
```

If you do not already have a [Landofile](./../config/lando.md) for your Lagoon site, we highly recommend you use [`lando init`](./../basics/init.md) to get one as that will automatically populate the above defaults for you. Manually creating a Landofile with these things set correctly can be difficult and is *highly discouraged.*

Note that if the above config options are not enough, all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Setting Lagoon labels

Under the hood the `lagoon` recipe uses special Docker labels to connect Lagoon services to Lando ones. If your project uses one of the Amazee.io starting templates like [this one for Drupal 9](https://github.com/amazeeio/drupal-example-simple) then you should be good to go, no further setup is required.

However, if you are using a legacy template or a bespoke Lagoon setup then you will need to manually add these labels into your Lagoon's `docker-compose.yml`. Here is an example of a `docker-compose.yml` with non-essential config removed for readability.

```yaml
services:
  cli: # cli container, will be used for executing composer and any local commands (drush, drupal, etc.)
    labels:
      # Lagoon Labels
      lagoon.type: cli-persistent
      # Lando type label
      lando.type: php-cli-drupal

  nginx:
    labels:
      lagoon.type: nginx-php-persistent
      lando.type: nginx-drupal

  php:
    labels:
      lagoon.type: nginx-php-persistent
      lando.type: php-fpm

  mariadb:
    image: uselagoon/mariadb-drupal:latest
    labels:
      lagoon.type: mariadb
      lando.type: mariadb-drupal
    ports:
      - "3306" # exposes the port 3306 with a random local port, find it with `docker-compose port mariadb 3306`
    << : *default-user # uses the defined user from top
    environment:
      << : *default-environment
```

For the most up to date list of supported labels, check out [this](https://github.com/lando/lando/blob/master/integrations/lando-lagoon/lib/services.js#L15). To see labels in action check out the official [Amazee.io Drupal 9 Lagoon example](https://github.com/amazeeio/drupal-example-simple/blob/9.x/docker-compose.yml#L40).

Also note that Lando additionally supports `lagoon.type === none` as documented over [here](https://docs.lagoon.sh/lagoon/using-lagoon-the-basics/docker-compose-yml#skip-ignore-containers).

### Build steps

If you have steps you need to run to get your site into a workable place you can put them in the `build` key of your recipes `config`. By default, we will run `composer install` but you may wish to augment that with any front end compilation tasks you may have as in the example below:

```yaml
recipe: lagoon
config:
  build:
    - composer install
    - yarn run compile:sass
    - drush sql-sync my-database
```

These will run against the [Lagoon PHP CLI Drupal container](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-cli-drupal/) so you will have access to all the tools there as well as the ones it inherits from the base [PHP CLI container](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-cli/).

Note that these will run the _first time_ you run `lando start`. You will need to run `lando rebuild` to trigger them again if you make changes.

### Customizing the stack

:::warning Customizations not fully tested
We _think_ most of the customizations below _should_ work but they have been very minimally tested. If you try one and it doesn't work, please [report an issue](https://github.com/lando/lando/issues/new/choose).
:::

Lando will read and interpret your normal `.lagoon.yml` and its associated Docker Compose files. This means that you should be able to do the customizations Lagoon has documented, run a `lando rebuild` and see the changes.  Lando reads the `lando.type` labels from the docker-compose file to ensure that the correct image is used for a service.

The services we currently support with links to their associated Lagoon docs is shown below:

* [PHP-FPM](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-fpm/)
* [PHP CLI](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-cli/)
* [Nginx](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/nginx/)
* [MariaDB](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/mariadb/)
* [PostgreSQL](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/postgres/)
* [Redis](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/redis/)
* [Solr](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/solr/)
* [Varnish](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/varnish/)

Note that we are testing against the "Drupal" variants of the above but it's _possible_ the base services work as well.

## External access

If you would like to connect to your database, or some other service, from your host using a GUI client like SequelPro, you can run [`lando info`](./../cli/info.md) and use the `external_connection` information and any relevant `creds` for the service you want to connect to.

You can also check out the environment variable [`LANDO INFO`](./../guides/lando-info.md), which is available in every Lando container, as it contains useful information about how your application can access other Lando services.

Some example connection info for the `mariadb` service is shown below:

```bash
lando info --service mariadb --format default

[ { service: 'mariadb',
    urls: [],
    type: 'lagoon-mariadb',
    healthy: true,
    creds: { user: 'drupal', password: 'drupal', database: 'drupal', rootpass: 'Lag00n' },
    internal_connection: { host: 'mariadb', port: '3306' },
    external_connection: { host: '127.0.0.1', port: '32790' },
    config: {},
    version: 'custom',
    meUser: 'mysql',
    hostnames: [ 'mariadb.drupalexample.internal' ] }]
```

## Tooling

Each Lando Lagoon recipe will also ship with the Lagoon toolchain. This means you can use `drush` and other tools via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling. Here are the things that ship with the `drupal` flavor by default.

You can also run `lando` from inside your app directory for a complete list of commands.

```bash
lando composer          Runs composer commands
lando db-export [file]  Exports database from a database service to a file
lando db-import <file>  Imports a dump file into a database service
lando drush             Runs drush commands
lando lagoon            Runs lagoon commands
lando mysql             Drops into a MySQL shell on a database service
lando node              Runs node commands
lando npm               Runs npm commands
lando php               Runs php commands
lando yarn              Runs yarn commands
```

Note that you can define your own commands by using out [tooling framework](tooling.md). Also check out the guides for the powerful [DB Export](./../guides/db-export.md) and [DB Import](./../guides/db-import.md) commands.

Also, check out the [Lagoon CLI Docs](https://amazeeio.github.io/lagoon-cli/commands/lagoon/) for more information on using `lando lagoon`.

### Mailhog

If you're using a Lagoon `php` container we will automatically set up `mailhog` for you so you can capture emails. You will see `urls` to access its web interface after you run `lando start` or if you run `lando info`.

```bash
NAME          drupal-example
LOCATION      /Users/pirog/work/lando/examples/lagoon-drupal/drupal
SERVICES      cli, nginx, php, mariadb, redis, solr, mailhog
MAILHOG URLS  http://localhost:32792
              http://inbox.drupal-example.lndo.site/
```

## Pulling and pushing databases and files

Lando also provides wrapper commands called `lando pull` and `lando push`.

With `lando pull` you can import data and download files from your remote Lagoon site. With `lando push` you can do the opposite, export data or upload files to your remote Lagoon site.

```bash
lando pull

Pull db and files from Lagoon

Options:
  --help          Shows lando or delegated command help if applicable
  --verbose, -v   Runs with extra verbosity
  --auth          Lagoon key
  --database, -d  The environment from which to pull the database
  --files, -f     The environment from which to pull the files
```

```bash
# Interactively pull databases and files
lando pull

# Import the remote database and files from the main environment
lando pull -d main -f main

# Effectively "do nothing"
lando pull --database none --files none
```

```bash
lando push

Push db and files to Lagoon

Options:
  --help          Shows lando or delegated command help if applicable
  --verbose, -v   Runs with extra verbosity
  --auth          Lagoon key
  --database, -d  The environment to which the database will be pushed
  --files, -f     The environment to which the files will be pushed
```

```bash
# Interactively push databases and files
lando push

# Export the local database and files to the main environment
lando push -d main -f main

# Effectively "do nothing"
lando push --database none --files none
```

<RelatedGuides tag="Lagoon"/>
