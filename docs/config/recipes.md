Recipes
=======

Recipes are Lando's highest level abstraction and they contain common mixes of routing, events, services and tooling. Said another way, recipes are common development use cases and starting points eg `LAMP` or `Drupal 8`.

To do this, recipes provide a base environment for a common development use case with configurability of its most obvious pieces. In your `.lando.yml`:

```yml
# Just give me a basic LAMP stack with recommended versions of all the things.
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

*   ####[Backdrop](./../tutorials/backdrop.md)
*   ####[Dotnet](./../services/dotnet.md)
*   ####[Drupal 6](./../tutorials/drupal6.md)
*   ####[Drupal 7](./../tutorials/drupal7.md)
*   ####[Drupal 8](./../tutorials/drupal8.md)
*   ####[Go](./../services/go.md)
*   ####[Joomla](./../tutorials/joomla.md)
*   ####[Laravel](./../tutorials/laravel.md)
*   ####[LAMP](./../tutorials/lamp.md)
*   ####[LEMP](./../tutorials/lemp.md)
*   ####[MEAN](./../tutorials/mean.md)
*   ####[Pantheon](./../tutorials/pantheon.md)
*   ####[Python](./../services/python.md)
*   ####[Ruby](./../services/ruby.md)
*   ####[WordPress](./../tutorials/wordpress.md)
*   ####[Custom](./../tutorials/custom.md)

Extending and Overriding Recipes
--------------------------------

Since recipes are loaded first you can still mix in other `services`, `events`, `routing` or `tooling` or override the config provided by the recipe itself. Here is an example that adds some additional services and tooling and overrides to the LAMP recipe.

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
