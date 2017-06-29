Backdrop
========

[Backdrop](https://backdropcms.org/) is the comprehensive CMS for small to medium sized businesses and non-profits. Backdrop CMS is free and Open Source. There are no acquisition fees or licensing costs.

You can easily boot up a best practices stack to run and develop Backdrop by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: backdrop
```

You can easily configure/override the Backdrop recipe and add in additional `.lando.yml` config such as `services`, `tooling`, and `proxy setting`.

Example
-------

{% codesnippet "./../examples/backdrop/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/backdrop)

Installing Backdrop
-------------------

You will need to make sure you [extract Backdrop](https://backdropcms.org/installation) into either your application root directory or the subdirectory specified by `webroot` in your recipe config.

Lando will handle your database credentials automatically during install.

If you want to see an example you can use the [example above](https://github.com/kalabox/lando/tree/master/examples/backdrop) to get started.

```bash
# Get backdrop
git clone https://github.com/backdrop/backdrop.git
cd backdrop

# Initialize and start the app up
lando init backdrop --recipe backdrop
lando start

# Visit https://backdrop.lndo.site to complete your installation.

# Check the status of your site with backdrush
cd www
lando backdrush status
```

Environmental Variables
-----------------------

Lando will add some helpful environmental variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
BACKDROP_SETTINGS=JSON_STRING_OF_BACKDROP_SETTINGS
DB_HOST=database
DB_USER=backdrop
DB_PASSWORD=backdrop
DB_NAME=backdrop
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
  "appserver": {
    "type": "php",
    "version": "7.0",
    "via": "apache",
    "webroot": "www",
    "urls": [
      "https://localhost:32950",
      "http://localhost:32951",
      "http://backdrop.lndo.site",
      "https://backdrop.lndo.site"
    ]
  },
  "database": {
    "type": "mysql",
    "version": "latest",
    "creds": {
      "user": "backdrop",
      "password": "backdrop",
      "database": "backdrop"
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
  node                     Run node commands
  npm                      Run npm commands
  composer                 Run composer commands
  php                      Run php commands
  mysql                    Drop into a MySQL shell
  backdrush                Run backdrush commands

Options:
  --help, -h  Show help                                                [boolean]

Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output

You need at least one command before moving on
```
