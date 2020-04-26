---
description: The best local development option for Lagoon a Docker Build and Deploy System for OpenShift & Kubernetes
---

# Lagoon **(experimental)**

[Lagoon](https://lagoon.readthedocs.io/en/latest/) solves what developers are dreaming about: A system that allows developers to locally develop their code and their services with Docker and run the exact same system in production. The same Docker images, the same service configurations and the same code.

This is currently a _very experimental_ integration that has the following _serious caveats_:

* This _only_ supports Drupal 8 flavored Lagoon projects
* This _only_ supports Lagoon's `php`, `nginx`, `cli`, `mariadb`, `redis` and `solr` containers
* If your project is not based on Amazee.io's [Drupal 8 Example Repo](https://github.com/amazeeio/drupal-example), YMMV
* It's not yet clear how much customization to your project is currently supported

However, if you'd like to try it out and give your feedback on what worked and what didn't then please continue.

You can report any issues or feedback [over here](https://github.com/lando/lando/issues/new/choose).

[[toc]]

## Getting Started

:::warning EXPERIMENTAL FEATURE
To access this feature you will need:

  * [Lando 3.0.0-rrc.5](./../help/2020-changelog.md) or higher or Lando [installed from source](./../basics/installation.md#from-source).
  * [Experimental mode](./experimental.md) turned on
:::

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familiar with [its basics](./../basics/)
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM), you can also run the following commands to try out this recipe against the Amazee.io [Drupal 8 Example](https://github.com/amazeeio/drupal-example).

```bash
# Get the D8 example rolling
lando init \
  --source remote \
  --remote-url git://github.com/amazeeio/drupal-example.git \
  --recipe lagoon

# Start it up
lando start

# Install drupal
lando drush site-install config_installer -y

# For some reason you need to do this combination of commands post
# install to get drupal into a good state
cd web
lando drush status
lando drush cr
lando drush status

# See list of commands you can run
lando

# List information about this apps services.
lando info
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box, they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe. If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: lagoon
config:
  flavor: drupal
  build:
    - composer install
```

If you do not already have a [Landofile](./../config/lando.md) for your Lagoon site, we highly recommend you use [`lando init`](./../basics/init.md) to get one as that will automatically populate the above defaults for you. Manually creating a Landofile with these things set correctly can be difficult and is *highly discouraged.*

Note that if the above config options are not enough, all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Flavor

This is not configurable. Lando only support Drupal 8 projects currently.

### Build steps

If you have steps you need to run to get your site into a workable place you can put them in the `build` key of your recipes `config`. By default, we will run `composer install` but you may wish to augment that with any front end compilation tasks you may have as in the example below:

```yaml
recipe: lagoon
config:
  flavor: drupal
  build:
    - composer install
    - yarn run compile:sass
    - drush sql-sync my-database
```

These will run against the [Lagoon PHP CLI Drupal container](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-cli-drupal/) so you will have access to all the tools there as well as the ones it inherits from the base [PHP CLI container](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-cli/).

Note that these will run the _first time_ you run `lando start`. You will need to run `lando rebuild` to trigger them again if you make changes.

### Customizing the stack

:::warning Customizations not fully tested
We _think_ most of the customizations below _should_ work but they have been very minimally tested. If you try one and it doesn't work, please [report an issue]((https://github.com/lando/lando/issues/new/choose)).
:::

Lando will read and interpret your normal `.lagoon.yml` and its associated Docker Compose files. This means that you should be able to do the customizations Lagoon has documented. Run a `lando rebuild` and see the changes. The services we currently support with links to their associated Lagoon docs is shown below:

* [MariaDB](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/mariadb/)
* [Nginx](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/nginx/)
* [PHP CLI](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-cli/)
* [PHP-FPM](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/php-fpm/)
* [Redis](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/redis/)
* [Solr](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/solr/)

Note that we are testing against the "Drupal" variants of the above but it's _possible_ the base services work as well.

## External access

If you would like to connect to your database, or some other service, from your host using a GUI client like SequelPro, you can run [`lando info`](./../cli/info.md) and use the `external_connection` information and any relevant `creds` for the service you want to connect to.

You can also check out the environment variable [`LANDO INFO`](./../guides/lando-info.md), which is available in every Lando container, as it contains useful information about how your application can access other Lando services.

Some example connection info for the `mariadb` and `solr` services is shown below:

```bash
lando info --service mariadb --service solr --format default

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
    hostnames: [ 'mariadb.drupalexample.internal' ] },

  { service: 'solr',
    urls:
     [ 'http://localhost:32789',
       'http://solradmin-drupal-example.lndo.site/',
       'https://solradmin-drupal-example.lndo.site/' ],
    type: 'lagoon-solr',
    healthy: true,
    internal_connection: { host: 'solr', port: '8983' },
    external_connection: { host: '127.0.0.1', port: '32789' },
    config: {},
    version: 'custom',
    meUser: 'solr',
    hostnames: [ 'solr.drupalexample.internal' ] } ]
```

Also note that the `solr` admin interface can be accessed with the provided `localhost` or `*.lndo.site` urls.

## Tooling

Each Lando Lagoon recipe will also ship with the Lagoon toolchain. This means you can use `drush` and other tools via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling. Here are the things that ship with the `drupal` flavor by default.

You can also run `lando` from inside your app directory for a complete list of commands.

```bash
lando composer          Runs composer commands
lando db-export [file]  Exports database from a database service to a file
lando db-import <file>  Imports a dump file into a database service
lando drush             Runs drush commands
lando mysql             Drops into a MySQL shell on a database service
lando node              Runs node commands
lando npm               Runs npm commands
lando php               Runs php commands
lando yarn              Runs yarn commands
```

Note that you can define your own commands by using out [tooling framework](tooling.md). Also check out the guides for the powerful [DB Export](./../guides/db-export.md) and [DB Import](./../guides/db-import.md) commands.

### Mailhog

If you're using a Lagoon `php` container we will automatically set up `mailhog` for you so you can capture emails. You will see `urls` to access its web interface after you run `lando start` or if you run `lando info`.

```bash
NAME          drupal-example
LOCATION      /Users/pirog/work/lando/examples/lagoon-drupal/drupal
SERVICES      cli, nginx, php, mariadb, redis, solr, mailhog
MAILHOG URLS  http://localhost:32792
              http://inbox-drupal-example.lndo.site/
              https://inbox-drupal-example.lndo.site/
```

### Solr Admin

Similarly we will expose the `solr` admin interface if you are using a Lagoon `solr` container.

```bash
NAME          drupal-example
LOCATION      /Users/pirog/work/lando/examples/lagoon-drupal/drupal
SERVICES      cli, nginx, php, mariadb, redis, solr, mailhog
SOLR URLS     http://localhost:32789
              http://solradmin-drupal-example.lndo.site/
              https://solradmin-drupal-example.lndo.site/
```

<RelatedGuides tag="Lagoon"/>
