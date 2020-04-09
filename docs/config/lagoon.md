---
description: The best local development option for Lagoon a Docker Build and Deploy System for OpenShift & Kubernetes
---

# Lagoon **(experimental)**

[Lagoon](https://lagoon.readthedocs.io/en/latest/) solves what developers are dreaming about: A system that allows developers to locally develop their code and their services with Docker and run the exact same system in production. The same Docker images, the same service configurations and the same code.

:::danger DON'T USE THIS!
This is an [experimental](./experimental.md) features as of Lando 3.0.0-rrc.4 but we _highly discourage_ you from using it at this point unless you are planning to help us develop it.

So, seriously, don't use it.
:::

[[toc]]

## Getting Started

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familar with [its basics](./../basics/)
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM) you can also run the following commands to try out this recipe against the Amazee.io [Drupal 8 Example](https://github.com/amazeeio/drupal-example).

```bash
# Get the D8 example rolling
lando init \
  --source remote \
  --remote-url https://github.com/amazeeio/drupal-example.git \
  --recipe lagoon

# Start it up
lando start

# Setup
lando composer install
lando drush site-install config_installer -y
lando drush cr

# List information about this app.
lando info
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe. If you are unsure about where this goes or what this means we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: lagoon
config:
  flavor: drupal
```

If you do not already have a [Landofile](./../config/lando.md) for your Lagoon site we highly recommend you use [`lando init`](./../basics/init.md) to get one as that will automatically populate the `flavor`, for you. Manually creating a Landofile with these things set correctly can be difficult and is *highly discouraged.*

Note that if the above config options are not enough all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

## Tooling

Each Lando Lagoon recipe will also ship with the Lagoon toolchain. This means you can use `drush` and other tools via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer          Runs composer commands
lando db-export [file]  Exports database from a database service to a file
lando db-import <file>  Imports a dump file into a database service
lando drush             Runs drush commands
lando mysql             Drops into a MySQL shell on a database service
lando php               Runs php commands
```

**Note that the above commands can differ by your recipes `flavor`.** The above are for `flavor: drupal`. We recommend you run `lando` in your app for a complete and up to date listing of your tooling.

You can also run `lando` from inside your app directory for a complete list of commands.

<RelatedGuides tag="Lagoon"/>
