Services
========

Lando services are our distillation of Docker containers into their most important options combined with some *special sauce* to setup good [networking](./networking.md), [certificates](./security.md) and [SSH keys](./ssh.md) as well as options to run [build steps](#build-steps) and provide low level [overrides](#overrides).

You can use the top-level `services` config in your [Landofile](./lando.yml) to define and configure a service. Here are the various options you can specify in any service regardless of the service type.

```yaml
services:
  myservice:
    type: some-service:with-optional-version
    overrides:
    build:
    build_as_root:
    run:
    run_as_root:
```

Note that you will need to set the `type` and its optional `version` to be eitehr one of the [supported services](#supported-services) below or as defined in one you [create your own](./../dev/plugins.md).

Each service also contains a bunch of its own configuartion options. As such we *highly recommend* you check out the documentation for each service. For example here are some of the configuration options available to the `php` service.

```yaml
service:
  appserver:
    type: php:7.2
    webroot: web
    xdebug: true
    composer:
      phpunit/phpunit: "*"
    config:
      php: config/php.ini
```

> #### Info::Docker compose files are loaded first
>
> If you want to load Docker compose files **and** use services, you should note that compose files are loaded first. This means that depending on how you name things, your services could override things set in your compose files.

Supported Services
------------------

The following services are currently supported. Please check out each one to learn how to use them.

*   ####[apache](./../tutorials/apache.md)
*   ####[custom](./../tutorials/compose.md)
*   ####[dotnet](./../tutorials/dotnet.md)
*   ####[elasticsearch](./../tutorials/elasticsearch.md)
*   ####[go](./../tutorials/go.md)
*   ####[mailhog](./../tutorials/mailhog.md)
*   ####[mariadb](./../tutorials/mariadb.md)
*   ####[memcached](./../tutorials/memcached.md)
*   ####[mongo](./../tutorials/mongo.md)
*   ####[mssql](./../tutorials/mssql.md)
*   ####[mysql](./../tutorials/mysql.md)
*   ####[nginx](./../tutorials/nginx.md)
*   ####[node](./../tutorials/node.md)
*   ####[php](./../tutorials/php.md)
*   ####[phpmyadmin](./../tutorials/phpmyadmin.md)
*   ####[postgres](./../tutorials/postgres.md)
*   ####[python](./../tutorials/python.md)
*   ####[redis](./../tutorials/redis.md)
*   ####[ruby](./../tutorials/ruby.md)
*   ####[solr](./../tutorials/solr.md)
*   ####[tomcat](./../tutorials/tomcat.md)
*   ####[varnish](./../tutorials/varnish.md)


Build Steps
-----------

One of the great features of Lando is its ability to destroy a single planet...  we mean add additional dependencies or build steps to your service without the hassle of having to build or manage your own Dockerfiles.

Note that build steps will **ONLY RUN THE FIRST TIME YOU SPIN UP YOUR APP.** That means that if you change them you will need to run `lando rebuild` for them to re-run.

> #### Hint::When should I use build steps?
>
> If you need additional on-server dependencies like php extensions or node modules then sounds like a build step may be for you. If you have automation you want to run **EVERY TIME** you may want to consider using [events](./events.md) instead.

There are four major build steps.

* `build` runs as "you" and *before* your service boots up
* `build_as_root` runs as `root` and *before* your service boots up
* `run` runs as "you" and *after* your service boots up
* `run_as_root` runs as `root` and *after* your service boots up

Here is an example to consider:

```yaml
services:
  appserver:
    type: php:7.1
    build_as_root:
      - apt-get update -y && apt-get install -y libmemcached-dev
      - pecl install memcached
      - docker-php-ext-enable memcached
    run:
      - composer install
  node:
    type: node:10
    build:
      - yarn
    run:
      - /helpers/some-helper-script.sh
    run_as_root:
      - echo "mysite.lndo.site 127.0.0.1" >> /etc/hosts
```

As you can likely surmise from the above each step is intended for a pretty specific use case

* Use `build` to install application dependencies that are needed before you start your application
* Use `build_as_root` to install low level server packages required by your application
* Use `run` to install application dependencies or run build steps that require your application be started first
* Use `run_as_root` for any other post-start `root` level one-time setup commands.

Of course these steps must make sense within the context of the container you are running them in. For example, you will not be able to run `dnf` inside of a `debian` flavored container. Also note that the default working directory that the commands run in inside the container is `/app`.

Another potential consideration is "dependent commands". Each line of a build step runs in a separate subshell so if COMMAND B is dependent on something provided by COMMAND A such as `sourcing` a file you should combine the commands with `&&` and put them on a single line

Advanced
--------

> #### Warning::ENTERING THE DANGER ZONE
>
> While the below options can be very powerful in the hands of a seasoned pro they are not for the faint of heart. Please be careful and note that YMMV.
>
> While we will make a good faith effort to support intrepid users please note that once you go down any of these paths you are more or less on your own!

### Overrides

Lando services are just an abstraction layer on top of the [Docker compose v3 file format](https://docs.docker.com/compose/compose-file/). What this means is that behind the scenes your Landofile is being translated into a *SHLOAD* of *SUPERNASTY* looking `docker-compose` files which are then being used to power your app.

We give you access to the Docker Compose layer with the `overrides` key.

> #### Info::You can only override Docker Compose's top-level `services` config
>
> Overrides you specify get merged and injected directly into the `services` config used by Docker Compose. This means that you cannot use overrides to alter top level `networks` or `volumes`. If you are looking for that kind of **POWER** we suggest you look at the [custom](./../tutorials/compose.md) service.

Here is an example of an overriden `apache` service that uses a custom image and injects some additional environment variables. However, you can put anything into `overrides` that you can put into the `services` config of a Docker Compose file.

```yaml
services:
  html:
    type: apache:custom
    overrides:
      environment:
        STUFF: THINGS
        THINGS: GUYS
      image: pirog/myapache:2
```

### Using Dockerfiles

If you find that your build steps are approaching Moby Dick length you can use overrides to build directly from a Dockerfile instead. This can keep your Landofile tidy and has the added benefit of your service being shippable like any Dockerfile.

Here is an example that extends our base `php` image to add another extension.

##### Landofile

Note that `build` is going to be relative to your app root.

```yaml
services:
  appserver:
    type: php:custom
    overrides:
      build: ./php
      image: pirog/php:7.1-fpm-custom
```

##### Dockerfile

This lives inside of the `./php` directory referenced in `build` above

```bash
FROM devwithlando/php:7.1-fpm

RUN apt-get update -y \
  && docker-php-ext-install pcntl
```

### Building a Custom Service

If the above is not enough and you still *crave more power* you can consider our "catch all" [custom](./../tutorials/compose.md) service. This allows power users to specify custom services that are not currently one of Lando's "supported" services.

Technically speaking, this service is just a way for a user to define a service directly using the [Docker Compose V3](https://docs.docker.com/compose/compose-file/) file format and still get some of the Lando *secret sauce*.

**THIS MEANS THAT IT IS UP TO THE USER TO DEFINE A SERVICE CORRECTLY**.

This service is useful if you are:

1. Thinking about contributing your own custom Lando service and just want to prototype something
2. Using Docker Compose config from other projects
3. Need a service not currently provided by Lando itself

Here is an example custom service

{% codesnippet "./../examples/compose/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/compose).
