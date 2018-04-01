Setting Up Additional Services
==============================

Lando allows you to override and add services in addition to the ones it comes with via recipes. In this tutorial we will...

*   Override the services provided by a recipe
*   Add additional services to a recipe

Overriding Recipe Services
--------------------------

Consider the starting `.lando.yml` file.

```yml
name: addservices
recipe: drupal8
config:
  php: '7.1'
```

Let's say we want to add some global composer dependencies, use a custom `php.ini` that is unique to our app and run an automatic `composer install` build step when we start up or rebuild our app.

First, run `lando info` to see the names of the services provided by the `drupal8` recipe. Generally, you will have an `appserver` and `database` container. Now let's update our `.lando.yml` file and override the `appserver` service, making a change to install phpunit. Run `lando rebuild` for our changes to take effect.

```yml
services:
  appserver:
    composer:
      phpunit/phpunit: '*'
    run:
      # Uncomment this when you have a composer.json in the root directory
      # - cd $LANDO_MOUNT && composer install
    config:
      conf: php.ini
```

Now let's override our `database` service to lock down its external port and to change the database credentials. Again, `lando rebuild` for the changes to apply.

```yml
services:
  appserver:
    composer:
      phpunit/phpunit: '*'
    run:
      # Uncomment this when you have a composer.json in the root directory
      # - cd $LANDO_MOUNT && composer install
    config:
      conf: php.ini
  database:
    portforward: 1337
    creds:
      user: tswift
      password: troubletroubletrouble
      database: songz
```

Adding Additional Services
--------------------------

Let's say our app requires more services and devtools. Specifically we need a `redis` caching backend, an `elasticsearch` index, `node` based cli tools and `mailhog` to test out our campaigns. You can easily add any of the [supported services](./../config/services.md#supported-services) to your `.lando.yml` to give any of the default recipes a little more muscle.

```yml
# Overriden recipe services
services:
  appserver:
    composer:
      phpunit/phpunit: '*'
    run:
      # Uncomment this when you have a composer.json in the root directory
      # - cd $LANDO_MOUNT && composer install
    config:
      conf: php.ini
  database:
    portforward: 1337
    creds:
      user: tswift
      password: troubletroubletrouble
      database: songz

# Additional services
  cache:
    type: redis
    persist: true
  search:
    type: elasticsearch:5.4
  mailhog:
    type: mailhog
    hogfrom:
      - appserver
  node-cli:
    type: node:6.10
    globals:
      gulp-cli: "latest"
```

Full Example
------------

{% codesnippet "./../examples/addservices/.lando.yml" %}{% endcodesnippet %}
