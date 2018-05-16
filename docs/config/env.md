Environment
===========

Container Environment Variables
-------------------------------

While you can add additional environment variables on a per service basis with [Advanced Service Configuration](./advanced.md), or globally using a `.env` file with an [Environment File](#environment-file) Lando will also inject some common and helpful environment variables into each service.

> #### Warning::This ONLY injects directly into the container environment.
>
> All of the below methods will inject variables **ONLY** into the container environment. This means that it is up to the user to use relevant mechanisms on the application side to grab them. For example, in `php` you will want to use something like the [`getenv()`](http://php.net/manual/en/function.getenv.php) function instead of server-provided globals like `$_ENV`.

### Default Environment Variables

To see the environment variables in each service run `lando ssh SERVICE -c env | grep LANDO_`. This assume you have not changed the `envPrefix` config value.

Here is an example of default container envvars inside of the [LEMP2 Example](https://github.com/lando/lando/tree/master/examples/lemp2).

```bash
# Discover envvars
lando ssh appserver -c env | grep LANDO_

# Output
LANDO_WEBROOT=/app
LANDO_HOST_GID=20
LANDO_WEBROOT_UID=33
LANDO_SERVICE_TYPE=php
LANDO_APP_ROOT_BIND=/Users/pirog/Desktop/work/lando/examples/lemp2
LANDO_MOUNT=/app
LANDO_HOST_UID=501
LANDO_CONFIG_DIR=/Users/pirog/.lando
LANDO_SERVICE_NAME=appserver
LANDO_HOST_IP=10.0.0.6
LANDO_APP_ROOT=/Users/pirog/Desktop/work/lando/examples/lemp2
LANDO_WEBROOT_USER=www-data
LANDO_WEBROOT_GROUP=www-data
LANDO_APP_NAME=lemp2
LANDO_DOMAIN=lndo.site
LANDO_HOST_OS=darwin
LANDO_WEBROOT_GID=33
LANDO_INFO=a JSON string representation of the lando info command
```

**NOTE:** See [this tutorial](./../tutorials/lando-info.md) for more information on how to properly use `$LANDO_INFO`.

### Environment File

If you drop a file named `.env` into the root directory of your app Lando will automatically inject the variables into all of your services. This is particularly useful if you want

1. To inject sensitive credentials into the environment (a la the 12-factor app model)
2. Store credentials in a `.gitignored` file that is not committed to the repo
3. Set config on a per environment basis

That file will generally take the form below.

```yaml
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

### Global Container Environment Variables

If you want to inject the same environment variables into every container in every app then you need to define the `containerGlobalEnv` in your [`config.yml`](./config.md).

**We do not recommend using this setting because it is not something you can set in your repository and needs to be set on a user basis.**

Here is an example `config.yml` for Global ENV injection.

```yaml
containerGlobalEnv:
  nicklewis: THEBLOG
```

Runtime Environment Variables
-----------------------------

Lando also makes the following available **ON YOUR HOST MACHINE** so that you can use them in your `.lando.yml` file. Again, this assume you have not changed the `envPrefix` config value.

Here is an example of default host envvars.

```bash
# Discover host level envvars
lando config | grep LANDO_

# Output
LANDO_CONFIG_DIR: /Users/pirog/.lando,
LANDO_APP_NAME: lando.dev,
LANDO_APP_ROOT: /Users/pirog/Desktop/work/lando,
LANDO_APP_ROOT_BIND: /Users/pirog/Desktop/work/lando,
LANDO_HOST_OS: darwin,
LANDO_HOST_UID: 501,
LANDO_HOST_GID: 20,
LANDO_HOST_IP: 10.0.0.6,
LANDO_WEBROOT_USER: www-data,
LANDO_WEBROOT_GROUP: www-data,
LANDO_WEBROOT_UID: 33,
LANDO_WEBROOT_GID: 33
LANDO_ENGINE_CONF: /Users/pirog/.lando,
LANDO_ENGINE_ID: 501,
LANDO_ENGINE_GID: 20,
LANDO_ENGINE_HOME: /Users/pirog,
LANDO_ENGINE_IP: tcp://127.0.0.1,
LANDO_ENGINE_REMOTE_IP: 10.0.0.6,
LANDO_ENGINE_SCRIPTS_DIR: /Users/pirog/.lando/engine/scripts,
LANDO_CONFIG_DIR: /Users/pirog/.lando,
LANDO_APP_NAME: lando.dev,
LANDO_APP_ROOT: /Users/pirog/Desktop/work/lando,
LANDO_APP_ROOT_BIND: /Users/pirog/Desktop/work/lando,
LANDO_HOST_OS: darwin,
LANDO_HOST_UID: 501,
LANDO_HOST_GID: 20,
LANDO_HOST_IP: 10.0.0.6,
LANDO_WEBROOT_USER: www-data,
LANDO_WEBROOT_GROUP: www-data,
LANDO_WEBROOT_UID: 33,
LANDO_WEBROOT_GID: 33
```
