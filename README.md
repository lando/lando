Lando
=====

<p align="center"><a href="https://lando.dev" target="_blank"><img width=250" src="https://docs.lando.dev/images/hero-pink.png" alt="Lando logo"></a></p>

<h1 align="center">Lando</h1>

Lando is for developers who want to:

* Quickly specify and painlessly spin up the [services](http://docs.devwithlando.io/config/services.html) and [tooling](http://docs.devwithlando.io/config/tooling.html) needed to develop their projects.
* Ship these local development dependencies in a per-project, lives-in-git [config file](http://docs.devwithlando.io/config/lando.html)
* Automate complex [build steps](http://docs.devwithlando.io/config/services.html#build-steps), testing setups, deployments or other [repeated-more-than-once workflows](http://docs.devwithlando.io/config/events.html)
* Avoid the built-in-masochism of directly using `docker` or `docker-compose`

It's a free, open source, cross-platform, **local** development environment and DevOps tool built on [Docker](http://docker.com) container technology and developed by [Tandem](http://thinktandem.io). Designed to work with most major languages, frameworks and services, Lando provides an easy way for developers of all skill levels to specify simple or complex requirements for their projects, and then quickly get to work on them.

**Think of it as your local development dependency management and automation tool.** Note that while you _can_ run Lando in production it is _highly_ discouraged, not recommended and 100% not supported!

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

**As an abstraction layer** Lando vastly reduces the complexity of spinning up containers by exposing only the most relevant config for a given "service" and setting "sane defaults". Lando also provides "recipes" which are common combinations of services and their tooling that satisfy a given development use case eg Drupal, Python, Laravel, Dotnet, etc.

**As a superset** Lando provides ways for developers to run complex commands, build steps and automation on their services without the hassle of custom Dockerfiles or long "docker exec" commands. Think `lando yarn add express`. Think clear my applications cache after I import a database. Think install this `php-extension` before my appserver starts and then `composer install` after it does.

**As a utility** Lando handles some of the more arduous setup required for a *good* Docker Compose setup eg proxying, nice urls, cross-application networking (think Vue.js frontend talking to separate Laravel backend), host-container file permission handling, file sharing, per-container SSL certificate handling, ssh-key handling, etc.

**And!** If you don't like the default choices we've made all of the above is highly configurable down to the Docker Compose level itself!

Begin by checking out
---------------------

*   [Lando basics](http://docs.devwithlando.io/started.html)
*   [Lando CLI usage](http://docs.devwithlando.io/cli/usage.html)
*   [Installing Lando](https://docs.devwithlando.io/installation/system-requirements.html)

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

Or build up from a base language
--------------------------------

*   [dotnet](http://docs.devwithlando.io/tutorials/dotnet.html)
*   [go](http://docs.devwithlando.io/tutorials/go.html)
*   [node](http://docs.devwithlando.io/tutorials/node.html)
*   [php](http://docs.devwithlando.io/tutorials/php.html)
*   [python](http://docs.devwithlando.io/tutorials/python.html)
*   [ruby](http://docs.devwithlando.io/tutorials/ruby.html)

And then mix in additional auxiliary services
---------------------------------------------

*   [apache](http://docs.devwithlando.io/tutorials/apache.html)
*   [elasticsearch](http://docs.devwithlando.io/tutorials/elasticsearch.html)
*   [mailhog](http://docs.devwithlando.io/tutorials/mailhog.html)
*   [mariadb](http://docs.devwithlando.io/tutorials/mariadb.html)
*   [memcached](http://docs.devwithlando.io/tutorials/memcached.html)
*   [mongo](http://docs.devwithlando.io/tutorials/mongo.html)
*   [mssql](http://docs.devwithlando.io/tutorials/mssql.html)
*   [mysql](http://docs.devwithlando.io/tutorials/mysql.html)
*   [nginx](http://docs.devwithlando.io/tutorials/nginx.html)
*   [phpmyadmin](http://docs.devwithlando.io/tutorials/phpmyadmin.html)
*   [postgres](http://docs.devwithlando.io/tutorials/postgres.html)
*   [redis](http://docs.devwithlando.io/tutorials/redis.html)
*   [solr](http://docs.devwithlando.io/tutorials/solr.html)
*   [tomcat](http://docs.devwithlando.io/tutorials/tomcat.html)
*   [varnish](http://docs.devwithlando.io/tutorials/varnish.html)

And then dive deep into reference materials
-------------------------------------------

*   [CLI](http://docs.devwithlando.io/cli/usage.html)
*   [Landofiles](http://docs.devwithlando.io/config/lando.html)
*   [Environment](http://docs.devwithlando.io/config/env.html)
*   [Events](http://docs.devwithlando.io/config/events.html)
*   [Networking](http://docs.devwithlando.io/config/networking.html)
*   [Proxy](http://docs.devwithlando.io/config/proxy.html)
*   [Recipes](http://docs.devwithlando.io/config/recipes.html)
*   [Services](http://docs.devwithlando.io/config/services.html)
*   [Tooling](http://docs.devwithlando.io/config/tooling.html)
*   [SSH Keys](http://docs.devwithlando.io/config/ssh.html)
*   [SSL/TLS](http://docs.devwithlando.io/config/security.html)
*   [Shared Files](http://docs.devwithlando.io/config/files.html)
*   [Global Config](http://docs.devwithlando.io/config/config.html)

And then check out some helpful guides
--------------------------------------

*   [Updating your Landofiles to 3.0.0-rc.2+](http://docs.devwithlando.io/guides/updating-to-rc2.html)
*   [Accessing Your Services Externally](http://docs.devwithlando.io/guides/external-access.html)
*   [Accessing Lando from Other Devices](http://docs.devwithlando.io/guides/access-by-other-devices.html)
*   [Exporting Databases](http://docs.devwithlando.io/guides/db-export.html)
*   [Importing Databases](http://docs.devwithlando.io/guides/db-import.html)
*   [Killer D8 Workflow with Platform.sh](https://thinktandem.io/blog/2017/10/23/killer-d8-workflow-using-lando-and-platform-sh/)
*   [Lando + PhpStorm + Xdebug](http://docs.devwithlando.io/guides/lando-phpstorm.html)
*   [Offline Development](http://docs.devwithlando.io/guides/offline-dev.html)
*   [Using $LANDO_INFO](http://docs.devwithlando.io/guides/lando-info.html)
*   [Using NodeJS Frontend Tooling](http://docs.devwithlando.io/guides/frontend.html)
*   [Using Lando in Visual Studio Code](http://docs.devwithlando.io/guides/lando-with-vscode.html)
*   [Climbing a mountain for love](https://www.youtube.com/watch?v=tkBVDh7my9Q)

And the known issues
--------------------

*   [DNS Rebinding Protection](http://docs.devwithlando.io/issues/dns-rebind.html)
*   [File Uploads on Windows](http://docs.devwithlando.io/issues/win-file-upload.html)
*   [File Syncing Stalled](http://docs.devwithlando.io/issues/file-sync.html)
*   [Running VB and HyperV](http://docs.devwithlando.io/issues/win-also-vb.html)
*   [Running behind a proxy](http://docs.devwithlando.io/issues/proxy.html)
*   [Switching Database Config](http://docs.devwithlando.io/issues/switching-dbs.html)

You can also get some troubleshooting and support
-------------------------------------------------

*   [Accessing Logs](http://docs.devwithlando.io/troubleshooting/logs.html)
*   [Using Lando with Kalabox](http://docs.devwithlando.io/troubleshooting/wkbox.html)
*   [Reporting Issues](https://github.com/lando/lando/issues)
*   [Slack Channel](https://launchpass.com/devwithlando)

Or learn how to contribute
--------------------------

*   [Overview](http://docs.devwithlando.io/contrib/contributing.html)
*   [Project Vision](http://docs.devwithlando.io/contrib/vision.html)
*   [How to Contribute](http://docs.devwithlando.io/contrib/how.html)
*   [Governance](http://docs.devwithlando.io/contrib/gov.html)
*   [Roles and Responsibilities](http://docs.devwithlando.io/contrib/roles.html)
*   [Security](http://docs.devwithlando.io/contrib/security.html)
*   [Resources](http://docs.devwithlando.io/contrib/resources.html)

And finally check out some helpful and tested-on-every-build examples
---------------------------------------------------------------------

#### Core functionality

*   [Build Steps](https://github.com/lando/lando/tree/master/examples/services)
*   [Environment Files](https://github.com/lando/lando/tree/master/examples/base)
*   [Events](https://github.com/lando/lando/tree/master/examples/events)
*   [Landofiles](https://github.com/lando/lando/tree/master/examples/base)
*   [Networking](https://github.com/lando/lando/tree/master/examples/networking)
*   [Overrides](https://github.com/lando/lando/tree/master/examples/services)
*   [Proxying](https://github.com/lando/lando/tree/master/examples/proxy)
*   [Tooling](https://github.com/lando/lando/tree/master/examples/tooling)

#### Recipes

*   [Backdrop](https://github.com/lando/lando/tree/master/examples/backdrop)
*   [Drupal 6](https://github.com/lando/lando/tree/master/examples/drupal6)
*   [Drupal 7](https://github.com/lando/lando/tree/master/examples/drupal7)
*   [Drupal 8](https://github.com/lando/lando/tree/master/examples/drupal8)
*   [Joomla](https://github.com/lando/lando/tree/master/examples/joomla)
*   [LAMP](https://github.com/lando/lando/tree/master/examples/lamp)
*   [Laravel](https://github.com/lando/lando/tree/master/examples/laravel)
*   [LEMP](https://github.com/lando/lando/tree/master/examples/lemp)
*   [MEAN](https://github.com/lando/lando/tree/master/examples/mean)
*   [Pantheon](https://github.com/lando/lando/tree/master/examples/pantheon)
*   [WordPress](https://github.com/lando/lando/tree/master/examples/wordpress)

#### Services

*   [Apache](https://github.com/lando/lando/tree/master/examples/apache)
*   [Compose](https://github.com/lando/lando/tree/master/examples/compose)
*   [Dotnet](https://github.com/lando/lando/tree/master/examples/dotnet)
*   [Elasticsearch](https://github.com/lando/lando/tree/master/examples/elasticsearch)
*   [Go](https://github.com/lando/lando/tree/master/examples/go)
*   [MailHog](https://github.com/lando/lando/tree/master/examples/mailhog)
*   [MariaDB](https://github.com/lando/lando/tree/master/examples/mariadb)
*   [Memcached](https://github.com/lando/lando/tree/master/examples/memcached)
*   [mongo](https://github.com/lando/lando/tree/master/examples/mongo)
*   [MSSQL](https://github.com/lando/lando/tree/master/examples/mssql)
*   [mysql](https://github.com/lando/lando/tree/master/examples/mysql)
*   [nginx](https://github.com/lando/lando/tree/master/examples/nginx)
*   [node](https://github.com/lando/lando/tree/master/examples/node)
*   [PHP](https://github.com/lando/lando/tree/master/examples/php)
*   [PhpMyAdmin](https://github.com/lando/lando/tree/master/examples/pma)
*   [Postgres](https://github.com/lando/lando/tree/master/examples/postgres)
*   [Python](https://github.com/lando/lando/tree/master/examples/python)
*   [Redis](https://github.com/lando/lando/tree/master/examples/redis)
*   [Ruby](https://github.com/lando/lando/tree/master/examples/ruby)
*   [Solr](https://github.com/lando/lando/tree/master/examples/solr)
*   [Tomcat](https://github.com/lando/lando/tree/master/examples/tomcat)
*   [Varnish](https://github.com/lando/lando/tree/master/examples/varnish)

#### Other

*   [SQL Export](https://github.com/lando/lando/tree/master/examples/sql-export)
*   [SQL Import](https://github.com/lando/lando/tree/master/examples/sql-import)

Security Issues
---------------

If you have discovered a security issue with Lando, please contact the Lando Security Team directly at
[security@devwithlando.io](mailto:security@devwithlando.io). We manage security issues separately in a private repository until the issue has been resolved. Even if you're not sure if it's a security problem, please contact the security team before filing an issue, blogging, or
tweeting about it.

Other Resources
---------------

*   [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
