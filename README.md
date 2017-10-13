Lando
=====

![screenshot](https://raw.githubusercontent.com/lando/lando/master/docs/images/lando-screenshot.png)

Lando is for developers who want to easily specifiy and quickly spin up the services and tools needed to develop their projects.

Lando is a free, open source and cross-platform local development environment and DevOps tool built on [Docker](http://docker.com) container technology and developed by [Tandem](http://thinktandem.io). It is designed to work with most major languages, frameworks and services and to provide an easy way for users to specify simple or complex development requirements for their projects.

In that way it can be thought of as a development dependency management tool.

With Lando you can...

*   Easily mimic your production environment locally.
*   Standardize your teams dev environments and tooling on OSX, Windows and Linux.
*   Integrate with hosting providers like [Pantheon](https://pantheon.io)
*   Store all of the above in a version controlled config file called `.lando.yml`
*   Easily customize or extend tooling, deployment options and basically any other functionality.
*   Free yourself from the tyranny of inferior local development products.

Begin by checking out the
-------------------------

*   [Installation Guide](http://docs.devwithlando.io/installation/installing.html)

Then spin up one of our preconfigured recipe start states
---------------------------------------------------------

*   [Backdrop](http://docs.devwithlando.io/tutorials/backdrop.html)
*   [Drupal 6](http://docs.devwithlando.io/tutorials/drupal6.html)
*   [Drupal 7](http://docs.devwithlando.io/tutorials/drupal7.html)
*   [Drupal 8](http://docs.devwithlando.io/tutorials/drupal8.html)
*   [Joomla](http://docs.devwithlando.io/tutorials/joomla.html)
*   [Laravel](http://docs.devwithlando.io/tutorials/laravel.html)
*   [MEAN](http://docs.devwithlando.io/tutorials/mean.html)
*   [LAMP](http://docs.devwithlando.io/tutorials/lamp.html)
*   [LEMP](http://docs.devwithlando.io/tutorials/lemp.html)
*   [Pantheon](http://docs.devwithlando.io/tutorials/pantheon.html)
*   [WordPress](http://docs.devwithlando.io/tutorials/wordpress.html)
*   [Custom](http://docs.devwithlando.io/tutorials/custom.html)

Or build up from a base language
--------------------------------

*   [dotnet](http://docs.devwithlando.io/services/dotnet.html)
*   [go](http://docs.devwithlando.io/services/go.html)
*   [node](http://docs.devwithlando.io/services/node.html)
*   [php](http://docs.devwithlando.io/services/php.html)
*   [python](http://docs.devwithlando.io/services/python.html)
*   [ruby](http://docs.devwithlando.io/services/ruby.html)

And then mix in additional auxiliary services
---------------------------------------------

*   [apache](http://docs.devwithlando.io/services/apache.html)
*   [elasticsearch](http://docs.devwithlando.io/services/elasticsearch.html)
*   [mailhog](http://docs.devwithlando.io/services/mailhog.html)
*   [mariadb](http://docs.devwithlando.io/services/mariadb.html)
*   [memcached](http://docs.devwithlando.io/services/memcached.html)
*   [mongo](http://docs.devwithlando.io/services/mongo.html)
*   [mssql](http://docs.devwithlando.io/services/mssql.html)
*   [mysql](http://docs.devwithlando.io/services/mysql.html)
*   [nginx](http://docs.devwithlando.io/services/nginx.html)
*   [phpmyadmin](http://docs.devwithlando.io/services/phpmyadmin.html)
*   [postgres](http://docs.devwithlando.io/services/postgres.html)
*   [redis](http://docs.devwithlando.io/services/redis.html)
*   [solr](http://docs.devwithlando.io/services/solr.html)
*   [varnish](http://docs.devwithlando.io/services/varnish.html)

And then try out some advanced stuff
------------------------------------

*   [Adding additional services](http://docs.devwithlando.io/tutorials/setup-additional-services.html)
*   [Adding additional tooling](http://docs.devwithlando.io/tutorials/setup-additional-tooling.html)
*   [Adding additional routes](http://docs.devwithlando.io/config/proxy.html)
*   [Adding additional events](http://docs.devwithlando.io/config/events.html)
*   [Setting up front end tooling](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Accessing services (eg your database) from the host](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Importing SQL databases](http://docs.devwithlando.io/tutorials/db-import.html)
*   [Exporting SQL databases](http://docs.devwithlando.io/tutorials/db-export.html)
*   [Using Composer to Manage a Project](http://docs.devwithlando.io/tutorials/composer-tutorial.html)
*   [Lando and CI](http://docs.devwithlando.io/tutorials/lando-and-ci.html)
*   [Lando, Pantheon, CI, and Behat (BDD)](http://docs.devwithlando.io/tutorials/lando-pantheon-workflow.html)

And then dive deep into reference materials
-------------------------------------------

*   [Configuration](http://docs.devwithlando.io/config/lando.html)
*   [Recipes](http://docs.devwithlando.io/config/services.html)
*   [Services](http://docs.devwithlando.io/config/services.html)
*   [Tooling](http://docs.devwithlando.io/config/tooling.html)
*   [CLI](http://docs.devwithlando.io/cli/usage.html)
*   [Contributing](http://docs.devwithlando.io/dev/contributing.html)
*   [API](http://docs.devwithlando.io/dev/api/lando.html)
*   [Troubleshooting and Support](http://docs.devwithlando.io/troubleshooting/logs.html)
*   [Examples](https://github.com/lando/lando/tree/master/examples)

Or TL;DR
--------

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
lando init
lando start
```

#### 3. Or pull from GitHub or Pantheon

```bash
mkdir -p mysite
cd mysite
lando init pantheon | lando init github
lando start
```

You can also easily configure a `lando.yml` [recipe](http://docs.devwithlando.io/config/recipe.html)

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

or go totally nuts and scaffold out a [custom stack](http://docs.devwithlando.io/config/services.html)

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
  post-mycustomthing:
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
