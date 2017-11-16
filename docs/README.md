Lando
=====

![screenshot](https://raw.githubusercontent.com/lando/lando/master/docs/images/lando-screenshot.png)

Lando is for developers who want to quickly specify and painlessly spin up the services and tools needed to develop their projects.

It's a free, open source, cross-platform, local development environment and DevOps tool built on [Docker](http://docker.com) container technology and developed by [Tandem](http://thinktandem.io). Designed to work with most major languages, frameworks and services, Lando provides an easy way for developers of all types to specify simple or complex requirements for their projects, and then quickly get to work on them. Think of it as your local development's dependency management tool. It can even be installed right beside an old Kalabox installation with no interference, or used as a complete upgrade-replacement.

With Lando you can...

*   Easily mimic your production environment locally.
*   Standardize your teams dev environments and tooling on OSX, Windows and Linux.
*   Integrate with hosting providers like [Pantheon](https://pantheon.io)
*   Store all of the above in a version controlled config file called `.lando.yml`
*   Easily customize or extend tooling, deployment options and basically any other functionality.
*   Free yourself from the tyranny of inferior local development products.

Begin by checking out
---------------------

*   [How to install Lando](http://docs.devwithlando.io/installation/installing.html)
*   [Lando basics](http://docs.devwithlando.io/started.html)

Then try out one of our preconfigured recipe start states
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

And then get some pro workflow dialed
-------------------------------------

*   [Using Composer to Manage a Project](http://docs.devwithlando.io/tutorials/composer-tutorial.html)
*   [Lando and CI](http://docs.devwithlando.io/tutorials/lando-and-ci.html)
*   [Lando, Pantheon, CI, and Behat (BDD)](http://docs.devwithlando.io/tutorials/lando-pantheon-workflow.html)
*   [Killer D8 Workflow with Platform.sh](https://thinktandem.io/blog/2017/10/23/killer-d8-workflow-using-lando-and-platform-sh/)

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

And then dive deep into reference materials
-------------------------------------------

*   [Configuration](http://docs.devwithlando.io/config/lando.html)
*   [Recipes](http://docs.devwithlando.io/config/recipes.html)
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

Other Resources
---------------

*   [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
