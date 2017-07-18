Services
========

Lando provides a way to easily specify the services and tooling your app needs via `.lando.yml`. You can use services to replace the loading of Docker compose files, although you can use both.

> #### Info::Docker compose files are loaded first
>
> If you want to load Docker compose files **and** use services, you should note that compose files are loaded first. This means that depending on how you name things, your services could override things set in your compose files.

Supported Services
------------------

The following services are currently supported. Please check out each one to learn how to use them.

*   ####[apache](./../services/apache.md)
*   ####[mailhog](./../services/mailhog.md)
*   ####[mariadb](./../services/mariadb.md)
*   ####[memcached](./../services/memcached.md)
*   ####[mysql](./../services/mysql.md)
*   ####[nginx](./../services/nginx.md)
*   ####[node](./../services/node.md)
*   ####[php](./../services/php.md)
*   ####[phpmyadmin](./../services/phpmyadmin.md)
*   ####[postgres](./../services/postgres.md)
*   ####[redis](./../services/redis.md)
*   ####[solr](./../services/solr.md)
*   ####[varnish](./../services/varnish.md)

Environment
-----------

While you can add additional environment variables on a per service basis (see [Advanced Service Configuration](#advanced-service-configuration) below), Lando will inject some common and helpful environment variables into each service.

These are also helpful in your `.lando.yml` file.

```bash
LANDO=ON
LANDO_APP_NAME=myapp
LANDO_APP_ROOT=/path/to/app/on/my/host
LANDO_SERVICE_TYPE=nginx
LANDO_HOST_UID=501
LANDO_HOST_GID=20
LANDO_HOST_IP=192.68.56.1
LANDO_SERVICE_NAME=appserver
LANDO_HOST_OS=darwin
LANDO_MOUNT=/path/to/your/approot

# The below may be overriden on a per-service basis
LANDO_WEBROOT_USER=www-data
LANDO_WEBROOT_GROUP=www-data
LANDO_WEBROOT_UID=33
LANDO_WEBROOT_GID=33
```

It will also make the following available **ON YOUR HOST MACHINE** so that you can use them in your `.lando.yml` file.

```bash
LANDO_APP_NAME=myapp
LANDO_APP_ROOT=/path/to/app/on/my/host
LANDO_APP_ROOT_BIND=/path/to/app/in/container
```

Shared Files
------------

While you can also share in additional files and directories via docker volumes (see [Advanced Service Configuration](#advanced-service-configuration) below), we share a few useful host directories into each service by default.

| Host Location | Container Location |
| -- | -- |
| `/path/to/my/app` | `/app` |
| `$HOME` | `/user` |

SSH Keys
--------

Lando will forward all the **NOT PASSWORD PROTECTED** keys in your `~/.ssh` and `~/.lando/keys` directories into each service. This means that you should be able to use your ssh keys like you were running commands natively on your machine. Please note that `~/.lando/keys` is a location managed by Lando so it is recommended that you do not alter anything in this folder.

| Host Location | Managed |
| -- | -- |
| `~/.ssh` | `no` |
| `~/.lando/keys` | `yes` |

Build Steps
-----------

If you want to script out some common build steps your app needs such as `composer install` or `grunt sass`, we let you run some additional commands on each service using the `build` key. Note that these steps must make sense within the context of the container you are running. In other words, if you want to do `composer` things, you probably want to set up a `build` on your `php` service and not on your `node` cli container. These commands are run as you, so you cannot do `sudo-y` things. For that sort of thing, see [Build Extras](#build-extras) below.

```yml
services:
  appserver:
    type: php:7.1
    build:
      - "cd $LANDO_MOUNT && composer install"
```

Build Extras
------------

If you do not want to use your own custom image or Dockerfile via [Advanced Service Configuration](#advanced-service-configuration), we let you do some extra service construction steps after each service is started. Note that these steps must make sense within the context of the container you are running. For example, you will not be able to run `dnf` inside of a `debian` flavored container. Unlike [Build Steps](#build-steps), these commands are **ALL RUN AS ROOT**, so take care with what you do.

This is useful for adding in some additional dev tools you might prefer like `vim` or for adding in things like extra php extensions not installed by default.

```yml
services:
  appserver:
    type: php:7.1
    extras:
      - "apt-get update -y"
      - "apt-get install netcat -y"
```

Pre-Run Scripting
-----------------

Lando will run any shell script it finds in your services `/scripts` directory before it boots up each service. We dogfood this functionality in our core plugins to generate self-signed certs and handle user permissions, but it can be used by the user to provide some additional customizations before a service is started. Consider the trivial example below.

An executable (eg `chmod +x`) `bash` script located in `scripts/my-script.sh` in your app root directory.

```bash
#!/bin/sh

echo "Hey this script is actually running!"

```

A `.lando.yml` that injects the script into the `appserver`'s `/scripts` directory.

```yml
sevices:
  appserver:
    scripts:
      - scripts/run-this.sh
```

Expected behavior

```bash
# Restart the app
lando restart

# Inspect the log to see if it printed our message
lando logs -s appserver
Attaching to backdrop_appserver_1
appserver_1        | Generating RSA private key, 2048 bit long modulus
appserver_1        | ..........+++
appserver_1        | .......+++
appserver_1        | e is 65537 (0x10001)
appserver_1        | Hey this script is actually running!
```

Advanced Service Configuration
------------------------------

Our services layer is an abstraction on top of the [Docker compose v3 file format](https://docs.docker.com/compose/compose-file/). Specifically, Lando will translate the configuration you specify for each service into relevant docker compose files and execute them at runtime. This gives you a lot of power to hypertune your services at the docker compose level. You can pass docker compose config into each service using the `overrides` key.

Here is an example of an overriden apache service that uses a custom image and injects some additional environment variables.

```yml
services:
  html:
    type: apache:custom
    overrides:
      services:
        environment:
          STUFF: THINGS
          THINGS: GUYS
        image: pirog/myapache:2
```
