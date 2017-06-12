WordPress
=========

[WordPress](https://wordpress.org) is open source software you can use to create a beautiful website, blog, or app.

You can easily boot up a best practices stack to run and develop WordPress by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: wordpress
```

You can easily configure/override the WordPress recipe and add in additional `.lando.yml` config such as `services`, `tooling`, `proxy setting` and `sharing`.

Example
-------

{% codesnippet "./../examples/wordpress/.lando.yml" %}{% endcodesnippet %}

You will need to restart your app with `lando restart` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/wordpress)

Installing WordPress
--------------------

You will need to make sure you [extract WordPress](https://wordpress.org) into either your application root directory or the subdirectory specified by `webroot` in your recipe config.

You will also want to scope out your database credentials (see [below](#getting-service-information)) so you can be prepped to enter them during the drupal installation. You will want to use `internal_connection` information.

If you want to try a composer based installation you can use the [example above](https://github.com/kalabox/lando/tree/master/examples/wordpress) to get started.

```bash
# Get the lando example
git clone https://github.com/kalabox/lando.git
cd lando/examples/wordpress

# Start the app up
lando start

# Install WP via composer
lando composer install

# Get your database credentials
lando info

# Visit https://wordpress.lndo.site to complete your installation.
```

Environmental Variables
-----------------------

Lando will add some helpful environmental variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container.

```bash
DB_HOST=database
DB_USER=wordpress
DB_PASSWORD=wordpress
DB_NAME=wordpress
DB_PORT=3306
```

Getting Service Information
---------------------------

You can get more in depth information about the services this recipe provides by running `lando info`

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "node": {
    "type": "node",
    "version": "6.10"
  },
  "cache": {
    "type": "redis",
    "version": "latest",
    "internal_connection": {
      "host": "cache",
      "port": 6379
    },
    "external_connection": {
      "host": "localhost",
      "port": "not forwarded"
    }
  },
  "appserver": {
    "type": "php",
    "version": "7.0",
    "via": "nginx",
    "webroot": "web",
    "share": {
      "remote": "/var/www/html"
    }
  },
  "nginx": {
    "urls": [
      "https://localhost:32867",
      "http://localhost:32868",
      "http://d7.lndo.site",
      "https://d7.lndo.site"
    ]
  },
  "database": {
    "type": "mariadb",
    "version": "10.1",
    "creds": {
      "user": "wordpress",
      "password": "wordpress",
      "database": "wordpress"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": true
    }
  }
}
```

### Getting Tooling Information

You can get more in depth information about the tooling this recipe provides by running `lando`

```bash
# Navigate to the app
cd /path/to/app

# Get list of available commands
lando

Usage: lando <command> [args] [options] [-- global options]

Commands:
  config                   Display the lando configuration
  destroy [appname]        Destroy app in current directory or [appname]
  info [appname]           Prints info about app in current directory or [appname]
  list                     List all lando apps
  logs [appname]           Get logs for app in current directory or [appname]
  poweroff                 Spin down all lando related containers
  rebuild [appname]        Rebuilds app in current directory or [appname]
  restart [appname]        Restarts app in current directory or [appname]
  start [appname]          Start app in current directory or [appname]
  stop [appname]           Stops app in current directory or [appname]
  version                  Display the lando version
  ssh [appname] [service]  SSH into [service] in current app directory or [appname]
  redis-cli                Run redis-cli commands
  node                     Run node commands
  npm                      Run npm commands
  composer                 Run composer commands
  php                      Run php commands
  mysql                    Drop into a MySQL shell
  drush                    Run Drush commands

Options:
  --help, -h  Show help                                                [boolean]

Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output

You need at least one command before moving on
```
