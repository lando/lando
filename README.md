Lando
=====

![screenshot](https://raw.githubusercontent.com/kalabox/lando/master/docs/images/lando-screenshot.png)

Lando is a free, open source and cross-platform local development environment tool built on [Docker](http://docker.com) container technology. It is the successor project to [Kalabox](http://kalabox.io).

With Lando you can...

*   Easily mimic your production environment locally.
*   Standardize your teams dev environments and tooling on OSX, Windows and Linux.
*   Integrate with hosting providers like [Pantheon](https://pantheon.io)
*   Store all of the above in a version controlled config file called `.lando.yml`
*   Easily customize or extend tooling, deployment options and basically any other functionality.
*   Free yourself from the tyranny of inferior local development products.

First Step
----------

*   [Installation](http://docs.lndo.io/installation/installing.html)

Get Started With...
-------------------

*   [Backdrop](http://docs.lndo.io/tutorials/backdrop.html)
*   [Drupal 6](http://docs.lndo.io/tutorials/drupal6.html)
*   [Drupal 7](http://docs.lndo.io/tutorials/drupal7.html)
*   [Drupal 8](http://docs.lndo.io/tutorials/drupal8.html)
*   [Laravel](http://docs.lndo.io/tutorials/laravel.html)
*   [LAMP](http://docs.lndo.io/tutorials/lamp.html)
*   [LEMP](http://docs.lndo.io/tutorials/lemp.html)
*   [Pantheon](http://docs.lndo.io/tutorials/pantheon.html)
*   [WordPress](http://docs.lndo.io/tutorials/wordpress.html)
*   [Custom](http://docs.lndo.io/tutorials/custom.html)

Advanced Usage
--------------

*   [Adding additional services](http://docs.lndo.io/tutorials/setup-additional-services.html)
*   [Adding additional tooling](http://docs.lndo.io/tutorials/setup-additional-tooling.html)
*   [Adding additional routes](http://docs.lndo.io/config/proxy.html)
*   [Adding additional events](http://docs.lndo.io/config/events.html)
*   [Setting up front end tooling](http://docs.lndo.io/tutorials/frontend.html)
*   [Accessing services (eg your database) from the host](http://docs.lndo.io/tutorials/frontend.html)
*   [Importing databases](http://docs.lndo.io/tutorials/db-import.html)
*   [Using Composer to Manage a Project](http://docs.lndo.io/tutorials/composer-tutorial.md)

References
----------

*   [Configuration](http://docs.lndo.io/config/lando.html)
*   [Recipes](http://docs.lndo.io/config/services.html)
*   [Services](http://docs.lndo.io/config/services.html)
*   [Tooling](http://docs.lndo.io/config/tooling.html)
*   [CLI](http://docs.lndo.io/cli/usage.html)
*   [Contributing](http://docs.lndo.io/dev/contributing.html)
*   [API](http://docs.lndo.io/dev/lando.html)
*   [Troubleshooting and Support](http://docs.lndo.io/troubleshooting/logs.html)
*   [Examples](https://github.com/kalabox/lando/tree/master/examples)

TL;DR
-----

A developer should be able to get a running site and the tools needed to develop that site with a single, short config file called `.lando.yml` that lives in the root directory of your project and a few `lando` commands.

#### 1. Pull a repo that already has a `.lando.yml`

```bash
git clone myproject.git
cd myproject
lando start
```

#### 2. Or init a local codebase with a `lando` recipe

```bash
cd /path/to/my/local/code
lando init appname
lando start
```

#### 3. Or pull from GitHub or Pantheon

```bash
mkdir -p mysite
cd mysite
lando init mysite pantheon | lando init mysite github
lando start
```

You can also easily configure a `lando.yml` [recipe](http://docs.lndo.io/config/recipe.html)

```yml
name: myproject
recipe: lamp
config:
  php: '7.1'
  webroot: www
  database: postgres:9.6
  config:
    php: config/php.ini
```

or go totally nuts and scaffold out a [custom stack](http://docs.lndo.io/config/services.html)

```yml
name: myproject
recipe: lamp
config:
  php: '7.1'
  webroot: www
  database: postgres:9.6
  config:
    php: config/php.ini
events:
  post-start:
    - appserver: echo SOMECOMMAND
    - echo SOMETHINGELSE
  post-mycustomthing
    - echo TEST
services:
  node:
    type: node:6.10
    globals:
      grunt-cli: "latest"
    build:
      - cd /app && npm install --production
  appserver:
    build:
      - cd /app && composer install
  mailhog:
    type: mailhog
    hogfrom:
      - appserver
  cache:
    type: memcached:1.4
    mem: 128
  search:
    type: solr:5.5
    core: hard
tooling:
  node:
    service: node
  npm:
    service: node
  grunt:
    service: node
  mycustomthing:
    service: appserver
    cmd: ps
```

Roadmap
-------

Lando is seeking to eventually merge into and then replace the [Kalabox](http://kalabox.io) project. This means that eventually Lando will have all the great features you've come to love in the Kalabox project. That said the primary high level goals for this transition are to

*   Provide a more reliable and robust underlying product
*   Replace [MAMP](http://mamp.info) and other local dev stacks
*   Reduce the complexity of building out complicated apps a la [Pantheon](http://pantheon.io)
*   Implement a simple per-app configuration file that can be stored in version control
*   Provide mechanisms for packaging in development tools and build steps along with services

There are various features that need to be implemented to achieve the above.

1.  ~~Transition the core framework~~
2.  ~~Provide a services layer on top of docker compose~~
3.  ~~Provide a build and tooling layer~~
4.  ~~Provide additional core services and tools~~
5.  ~~Provide a recipes layer on top of services~~
6.  ~~Provide handling of upstream git remotes (lando init command)~~
7.  ~~Provide an events layer~~
8.  ~~Replicate Pantheon environment~~
9.  ~~Integrate with Pantheon~~
10. Build GUI

Other Resources
---------------

*   [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
