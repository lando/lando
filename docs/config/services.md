---
description: Lando services are a curated set of Docker containers like php, apache, node, mysql that are stupid easy to use but also as configurable as any other Docker image.
---

# Services

Lando services are our distillation of Docker containers into their most important options combined with some *special sauce* to setup good [networking](./networking.md), [certificates](./security.md) and [SSH keys](./ssh.md) as well as options to run [build steps](#build-steps) and provide low level [overrides](#overrides).

You can use the top-level `services` config in your [Landofile](./lando.md) to define and configure a service. The various options you can specify in any service regardless of the service type are shown below:
```yaml
services:
  myservice:
    app_mount: cached
    type: some-service:with-optional-version
    overrides:
    build:
    build_as_root:
    run:
    run_as_root:
    moreHttpPorts: []
    scanner: true
```

`myservice` in the example above can actually be set to anything the user wants but common conventions are things like `appserver`, `index`, `cache`, `database` or `kanye`.

Note that you will need to set the `type` and its optional `version` to be either one of the [supported services](#supported-services) below or as defined in one you [create your own](./../contrib/contrib-plugins.md).

Each service also contains a bunch of its own configuration options. As such, we *highly recommend* you check out the documentation for each service. For example, some of the configuration options available to the `php` service are shown below:

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

::: warning Docker compose files are loaded first!
If you want to load Docker compose files **and** use services, you should note that compose files are loaded first. This means that depending on how you name things, your services could override things set in your compose files.
:::

## Supported Services

The following services are currently supported. Please check out each one to learn how to use them.

*   ### [apache](./apache.md)
*   ### [compose](./compose.md)
*   ### [dotnet](./dotnet.md)
*   ### [elasticsearch](./elasticsearch.md)
*   ### [go](./go.md)
*   ### [mailhog](./mailhog.md)
*   ### [mariadb](./mariadb.md)
*   ### [memcached](./memcached.md)
*   ### [mongo](./mongo.md)
*   ### [mssql](./mssql.md)
*   ### [mysql](./mysql.md)
*   ### [nginx](./nginx.md)
*   ### [node](./node.md)
*   ### [php](./php.md)
*   ### [phpmyadmin](./phpmyadmin.md)
*   ### [postgres](./postgres.md)
*   ### [python](./python.md)
*   ### [redis](./redis.md)
*   ### [ruby](./ruby.md)
*   ### [solr](./solr.md)
*   ### [tomcat](./tomcat.md)
*   ### [varnish](./varnish.md)

## Build Steps

One of the great features of Lando is its ability to destroy a single planet...  we mean add additional dependencies or build steps to your service without the hassle of having to build or manage your own Dockerfiles.

Note that build steps will **ONLY RUN THE FIRST TIME YOU SPIN UP YOUR APP.** That means if you change them, you will need to run `lando rebuild` for them to re-run. An exception to this is if one or more of your build steps error. When this happens Lando will run the build steps until they complete successfully.

:::tip When should I use build steps?
If you need additional on-server dependencies like php extensions or node modules, it sounds like a build step may be for you. If you have automation, you want to run **EVERY TIME** and you may want to consider using [events](./events.md) instead.
:::

There are four major build steps.

* `build` runs as "you" and *before* your service boots up
* `build_as_root` runs as `root` and *before* your service boots up
* `run` runs as "you" and *after* your service boots up
* `run_as_root` runs as `root` and *after* your service boots up

An example to consider is shown below:

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
      - echo "127.0.0.1 mysite.lndo.site" >> /etc/hosts
```

As you can likely surmise from the above, each step is intended for a pretty specific use case:

* Use `build` to install application dependencies that are needed before you start your application
* Use `build_as_root` to install low level server packages required by your application
* Use `run` to install application dependencies or run build steps that require your application be started first
* Use `run_as_root` for any other post-start `root` level one-time setup commands.

Of course, these steps must make sense within the context of the container you are running them in. For example, you will not be able to run `dnf` inside of a `debian` flavored container. Also, note that the default working directory that the commands run in inside the container is `/app`.

Another potential consideration is "dependent commands". Each line of a build step runs in a separate subshell; so if COMMAND B is dependent on something provided by COMMAND A such as `sourcing` a file, you should combine the commands with `&&` and put them on a single line.

### Using SCRIPTY things

While the following example *can* work, please note that it is **NOT SUPPORTED.**

```yaml
run:
  - |
    if [ ! -z $LANDO_MOUNT ]; then
      do something
      some other command
    fi
```

In these situations, it is **highly recommended** you create a script and reference that instead. This keeps things cleaner and more portable.

```bash
#!/bin/sh
if [ ! -z $LANDO_MOUNT ]; then
  do something
  some other command
fi
```

```yaml
run:
  - /app/my-script.sh
```

## Advanced

::: danger ENTERING THE DANGER ZONE
While the below options can be very powerful in the hands of a seasoned pro, they are not for the faint of heart. Please be careful and note that YMMV.

While we will make a good faith effort to support intrepid users, please note that once you go down any of these paths you are more or less on your own!
:::

### Overrides

Lando services are just an abstraction layer on top of the [Docker compose v3 file format](https://docs.docker.com/compose/compose-file/). What this means is that behind the scenes your Landofile is being translated into a *SHLOAD* of *SUPERNASTY* looking `docker-compose` files which are then being used to power your app.

We give you access to the Docker Compose layer with the `overrides` key.

::: tip You can only override Docker Compose's top-level `services` config
Overrides you specify get merged and injected directly into the `services` config used by Docker Compose. This means that you cannot use overrides to alter *top level* `networks` or `volumes`. If you are looking for that kind of **POWER**, we suggest you look at the [compose](./compose.md) service.
:::

Here is an example of an overridden `apache` service that uses a custom image and injects some additional environment variables. However, you can put anything into `overrides` that you can put into the `services` config of a Docker Compose file. Note that if you change the image, your success in running with that image is directly correlated to how close that image is to the ones we use by default. For that reason, it is **highly recommended** your custom images are extended from ours so your chance of doing this with great success is maximized.

If you are looking to use a *completely different* image then we recommend you use a [custom compose service](./compose.md).

```yaml
services:
  html:
    type: apache:custom
    overrides:
      environment:
        STUFF: THINGS
        THINGS: GUYS
      image: pirog/myapache:2
      volumes:
        - ./mythings:/tmp/mythings
```

### App Mount

Lando will automatically mount your codebase in every container at `/app` using the `:cached` performance optimization flag. However, you can change the mount flag on a per-service basis or disable the mount entirely if you so choose.

**Do not mount my application code**

Set `app_mount` to either `false` or `disabled`.

```yaml
services:
  my-service:
    type: apache
    app_mount: false
  my-service2:
    type: nginx
    app_mount: disabled
```

**Mount with a different flag**

Set `app_mount` to any valid Docker bind mount [third field](https://docs.docker.com/storage/bind-mounts/).

```yaml
services:
  my-service:
    type: apache
    app_mount: ro
  my-service2:
    type: nginx
    app_mount: delegated
```

### Localhost Assignment

Lando will attempt to assign `localhost` addresses to any service that has ports `80` or `443` exposed. By default, this is most of our services. An exception is the [`compose`](./compose.md) service which requires the user to manually expose the ports they need at the Docker Compose level. You can tell Lando to assign `localhost` addresses to additional `http` ports with the following.

```yaml
services:
  myservice:
    type: apache
    moreHttpPorts:
      - '8888'
    overrides:
      ports:
       - '8888'
```

Note that while you *can* do the above, it is highly unlikely you will *need* to do it as most Lando services provide automatic handling of this. Also note the use of the service overrides to ensure that port `8888` is actually exposed.

### Service URL Scanning

Lando will automatically try to scan all `localhost` and `proxy` URLs after your app starts. We do this to:

1. Provide some immediate feedback to the user regarding the health of their application and the routing that Lando has set up for it
2. Help compile first-run application caches behind the scenes to improve initial loaded-in-browser speed

Note that by default, the "scan" will pass unless your app returns either a `400`, `502` or `404` https status code. The results of the scan will be coded:

* GREEN - Scan passed and you are good to go!
* YELLOW - Scan was not attempted
* RED - There *may* be a problem with your networking, routing or application

That said, we do realize there are legitimate use cases where you may not want this behavior or have purposefully set up your application to emit one of the naughty status codes above. For these use cases, you can disable the scanner as shown below:

```yaml
services:
  myservice:
    type: apache
    scanner: false
```

### Using Dockerfiles

If you find that your build steps are approaching Moby Dick length, you can use overrides to build directly from a Dockerfile instead. This can keep your Landofile tidy and has the added benefit of your service being shippable like any Dockerfile.

An example that extends our base `php` image to add another extension is shown below:

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

This lives inside of the `./php` directory referenced in the `build` above.

```bash
FROM devwithlando/php:7.1-fpm

RUN apt-get update -y \
  && docker-php-ext-install pcntl
```

### Building a Custom Service

If the above is not enough and you still *crave more power*, you can consider our "catch all" [custom](./compose.md) service. This allows power users to specify custom services that are not currently one of Lando's "supported" services.

Technically speaking, this service is just a way for a user to define a service directly using the [Docker Compose V3](https://docs.docker.com/compose/compose-file/) file format and still get some of the Lando *secret sauce*.

**THIS MEANS THAT IT IS UP TO THE USER TO DEFINE A SERVICE CORRECTLY**.

This service is useful if you are:

1. Thinking about contributing your own custom Lando service and just want to prototype something
2. Using Docker Compose config from other projects
3. Need a service not currently provided by Lando itself

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/compose).

<RelatedGuides tag="Services"/>
