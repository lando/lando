---
description: Lando recipes set sane defaults for common use cases like Drupal, WordPress or MEAN but are also highly configurable and extensible for all occasions.
---

# Recipes

Recipes are Lando's highest level abstraction and they contain common combinations of [routing](./proxy.md), [services](./services.md), and [tooling](./tooling.md). Said another way, recipes are common development use cases and starting points (e.g. `LAMP` or `Drupal 8`).

[[toc]]

## Usage

You can use the top-level `recipe` config in your [Landofile](./lando.md) to select a recipe. Note that you will need to select one of the [supported recipes](#supported-recipes) or [create your own](./../contrib/contrib-plugins.html#recipes).

For example, we will use the [Drupal 8](./drupal8.md) recipe.

```yaml
recipe: drupal8
```

## Config

You can optionally configure some of the more obvious things in your recipe such as service versions, database types and config files using the top-level `config` config in your [Landofile](./lando.md).

::: tip
While a decent amount config is the same from recipe to recipe, we recommend you consult the documentation for the recipe you intend to use for the full list of its config options.
:::

For example, some of the configurable things in the [LAMP](./lamp.md) recipe are shown below:

```yml
recipe: lamp
config:
  php: '5.6'
  webroot: www
  database: postgres:11.1
  xdebug: true
  config:
    php: config/php.ini
    database: config/mysql.cnf
    vhosts: config/vhosts.conf
```

## Supported Recipes

The following recipes are currently offered. Please check out each one to learn how to specifically use them.

* [Acquia](./acquia.md) **(ALPHA})**
* [Backdrop](./backdrop.md)
* [Drupal 6](./drupal6.md)
* [Drupal 7](./drupal7.md)
* [Drupal 8](./drupal8.md)
* [Drupal 9](./drupal9.md)
* [Joomla](./joomla.md)
* [Lagoon](./lagoon.md) **(BETA)**
* [Laravel](./laravel.md)
* [LAMP](./lamp.md)
* [LEMP](./lemp.md)
* [MEAN](./mean.md)
* [Pantheon](./pantheon.md)
* [Platform.sh](./platformsh.md) **(BETA)**
* [Symfony](./symfony.md)
* [WordPress](./wordpress.md)

## Extending and Overriding Recipes

While the first Landofile below is totally valid and used by many people, there are even more people who set a recipe as a starting point for a more complex Landofile.

This is possible because recipes load all their stuff first. A consequence of that is that you can still mix in other [services](./services.md), [events](./services.md), [routing](./proxy.md) and [tooling](./tooling.md) or directly override the config provided by the recipe itself.

::: tip Service and Tooling discovery
Running `lando info` in your app directory is a good way to see what things your recipe offers. This is useful if you want to override or extend the things it provides, as in the example below:
:::

**That's cool bro...**

```yaml
name: my-app
recipe: laravel
```

**But it would be a lot cooler if you did this**

```yaml
name: myapp

# Start with the lamp recipe
recipe: lamp
config:
  php: '5.6'
  webroot: www
  database: postgres

# Add additional services
services:
  cache:
    type: redis
    persist: true
  node:
    type: node:6.10

  # Override our appserver to add some environmental variables
  # This service is provided by the lamp recipe
  appserver:
    overrides:
      environment:
        WORD: covfefe

# Add additional tooling
tooling:
  redis-cli:
    service: cache
  node:
    service: node
  npm:
    service: node
```

<RelatedGuides tag="Recipes"/>
