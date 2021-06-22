---
description: Lando sets a bunch of useful environment variables in each service by default, or you can inject your own by configuring your Landofile or using a custom environment file.
---

# Environment

Lando will both inject a bunch of helpful environment variables into each service and allow the user to inject their own either by [file](#environment-files) or [configuration](#environment-configuration). Note that these variables are only available **inside** each service and **not on your host machine.**

[[toc]]

## Default Environment Variables

While the default variables are more or less the same between services, we recommend you run the following command to get the most up-to-date and relevant list of envvars for your service. Note, this assumes you have not changed the `envPrefix` [global config](./global.md) value.

```bash
lando ssh -s appserver -c env | grep LANDO_
```

For reference, an example of the default container envvars inside of the [LAMP](https://github.com/lando/cli/tree/main/examples/lamp) recipe/example is shown below:

```bash
LANDO_WEBROOT_USER=www-data
LANDO_WEBROOT_GROUP=www-data
LANDO_WEBROOT_UID=33
LANDO_WEBROOT_GID=33
LANDO_HOST_UID=501
LANDO_HOST_GID=20
LANDO_HOST_USER=me
LANDO_CA_CERT=/lando/certs/lndo.site.pem
LANDO_CA_KEY=/lando/certs/lndo.site.key
LANDO_CONFIG_DIR=/Users/pirog/.lando
LANDO_DOMAIN=lndo.site
LANDO_HOST_HOME=/Users/pirog
LANDO_HOST_OS=darwin
LANDO_HOST_IP=host.docker.internal
LANDO_MOUNT=/app
LANDO_APP_NAME=lamp
LANDO_APP_ROOT=/Users/pirog/work/lando/examples/lamp
LANDO_APP_ROOT_BIND=/Users/pirog/work/lando/examples/lamp
LANDO_INFO=[{"service":"appserver","urls":["http://lamp.lndo.site","https://lamp.lndo.site"],"type":"php","via":"apache","webroot":".","config":{},"version":"7.2","hostnames":["appserver.lamp.internal"]},{"service":"database","urls":[],"type":"mysql","internal_connection":{"host":"database","port":"3306"},"external_connection":{"host":"localhost","port":true},"creds":{"database":"lamp","password":"lamp","user":"lamp"},"config":{},"version":"5.7","hostnames":["database.lamp.internal"]}]
LANDO_WEBROOT=/app/.
LANDO_SERVICE_TYPE=php
LANDO_SERVICE_NAME=appserver
```

**NOTE:** See [this tutorial](./../guides/lando-info.md) for more information on how to properly use `$LANDO_INFO`.

## Environment Files

You can tell Lando to inject additional environment variables into every service in your app using environment files. This is particularly useful if you want to:

1. Inject sensitive credentials into the environment a la the 12-factor app model
2. Store credentials in a `.gitignore` file that is not committed to the repo
3. Set config on a per environment basis

You can accomplish this using the `env_file` top level config in your [Landofile](./lando.md).

```yaml
env_file:
  - defaults.env
  - extras/special.env
```

These files are relative to your projects root directory.

These files will need to take the form below. Note that this is **not a yaml file**.

```yaml
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

By happenstance, you could previously use the *unsupported* syntax in your `env` files as follows:

```bash
WP_ENV=development
WP_HOME=http://wpb4.test
WP_SITEURL=${WP_HOME}/wp
```

Because we now directly use Docker Compose's `env_file` directive under the hood, this syntax no longer works. So you will have to do something as shown below:

```bash
WP_ENV=development
WP_HOME=http://wpb4.test
WP_SITEURL=http://wpb4.test/wp
```

If you add or change the `env_file` config, or alter the contents of any env files being used in this config, you will need to run `lando rebuild` for your changes to take effect.

::: warning This ONLY injects directly into the container environment!
We inject variables **ONLY** into the container environment. This means that it is up to the user to use relevant mechanisms on the application side to grab them.

For example, in `php` you will want to use something like the [`getenv()`](http://php.net/manual/en/function.getenv.php) function instead of server-provided globals like `$_ENV`.
:::

## Environment Configuration

If you'd like to avoid broad strokes and only inject certain environment variables into particular services, we recommend you make use of [service overrides](./services.md#overrides).
