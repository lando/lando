Lando
=====

![screenshot](https://raw.githubusercontent.com/lando/lando/master/docs/images/lando-screenshot.png)

Lando is for developers who want to:

* Quickly specify and painlessly spin up the services and tools needed to develop their projects.
* Ship these local development dependencies in a per-project, lives-in-git config file called `.lando.yml`
* Automate complex build steps, testing setups, deployments or other repeated-more-than-once workflows
* Avoid the built-in-masochism of directly using `docker` or `docker-compose`

It's a free, open source, cross-platform, **local** development environment and DevOps tool built on [Docker](http://docker.com) container technology and developed by [Tandem](http://thinktandem.io). Designed to work with most major languages, frameworks and services, Lando provides an easy way for developers of all skill levels to specify simple or complex requirements for their projects, and then quickly get to work on them.

**Think of it as your local development dependency management and automation tool.**

What is it good for?
--------------------

*   Mimicking your production environment locally
*   Standardizing your teams dev environments and tooling on OSX, Windows and Linux
*   Integrating with hosting providers like [Pantheon](https://pantheon.io)
*   Customizing or extending tooling, deployment options and basically any other functionality
*   Running CI tests locally, running local tests in CI
*   Using a single local development environment for *all* your projects
*   Freeing yourself from the tyranny of inferior local development products

Wait, doesn't Docker Compose do this?
-------------------------------------

Yes! Well, sort of. You can think of Lando as both an abstraction layer and superset of Docker Compose as well as a Docker Compose utility.

**As an abtraction layer** Lando vastly reduces the complexity of spinning up containers by exposing only the most relevant config for a given "service" and setting "sane defaults". Lando also provides "recipes" which are common combinations of services and their tooling that satisfy a given development use case eg Drupal, Python, Laravel, Dotnet, etc.

**As a superset** Lando provides ways for developers to run complex commands, build steps and automation on their services without the hassle of custom Dockerfiles or long "docker exec" commands. Think `lando yarn add express`. Think clear my applications cache after I import a database. Think install this `php-extension` before my appserver starts and then `composer install` after it does.

**As a utility** Lando handles some of the more arduous setup required for a *good* Docker Compose setup eg proxying, nice urls, cross-application networking (think Vue.js frontend talking to separate Laravel backend), host-container file permission handling, file sharing, per-container SSL certificate handling, ssh-key handling, etc.

**And!** If you don't like the default choices we've made all of the above is highly configurable down to the Docker Compose level itself!

Begin by checking out
---------------------

*   [Lando basics](http://docs.devwithlando.io/started.html)
*   [Lando CLI usage](http://docs.devwithlando.io/cli/usage.html)
*   [Installing Lando](http://docs.devwithlando.io/installation/installing.html)

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
*   [tomcat](http://docs.devwithlando.io/services/tomcat.html)
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
*   [Contributing](http://docs.devwithlando.io/contrib/contributing.html)
*   [API](http://docs.devwithlando.io/dev/api/api.html)
*   [Troubleshooting and Support](http://docs.devwithlando.io/troubleshooting/logs.html)
*   [Examples](https://github.com/lando/lando/tree/master/examples)

Security Issues
---------------

If you have discovered a security issue with Lando, please contact the Lando Security Team directly at
[security@devwithlando.io](mailto:security@devwithlando.io). We manage security issues separately in a private repository until the issue has been resolved. Even if you're not sure if it's a security problem, please contact the security team before filing an issue, blogging, or
tweeting about it.

Other Resources
---------------

*   [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
