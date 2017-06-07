Recipes
=======

Recipes are Lando's highest level abstraction and they contain common mixes of proxy settings, sharing, services and tooling. Said another way, recipes are common development use cases and starting points eg `LAMP` or `Drupal 8`.

To do this, recipes provide a base environment for a common development use case with configurability of its most obvious pieces. In your `.lando.yml`:

```yml
# Just give me a basic LAMP stack with recommended latest versions of all the things.
name: myapp
recipe: lamp
```

```yml
# Let me customize a few basic parts of my LAMP stack
name: myapp
recipe: lamp
config:
  php: '5.6'
  webroot: www
```

Supported Recipes
-----------------

The following recipes are currently offered. Please check out each one to learn how to use them.

  * ####[LAMP](./../recipes/lamp.md)
  * ####[LEMP](./../recipes/lemp.md)

Extending and Overriding Recipes
--------------------------------

Since recipes are loaded first you can still mix in other `services`, `proxy settings` or `tooling` or override the config provided by the recipe itself. Here is an example that adds some additional services and tooling and overrides to the LAMP recipe.

> #### Hint::Service and Tooling discovery
>
> Running `lando info` in your app directory is a good way to see what things your recipe offers. This is useful if you want to override or extend the things it provides, as in the example below.

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
      services:
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
