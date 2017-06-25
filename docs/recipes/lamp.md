LAMP
====

[LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) is a common technology stack designed to run `php` applications. It specifically means **L**inux, **A**pache **M**ySQL and **P**HP but is usually generalized to include other webservers like `nginx` and other relationship SQL databases such as `postgres` or `sqlite`.

You can easily boot up a LAMP stack for your app by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: lamp
```

You can easily configure/override the LAMP recipe and add in additional `.lando.yml` config such as `services`, `tooling`, `proxy setting` and `sharing`.

Example
-------

{% codesnippet "./../examples/lamp2/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/lamp2)

Environmental Variables
-----------------------

Lando will add some helpful environmental variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
DB_HOST=database
DB_USER=lamp
DB_PASSWORD=lamp
DB_NAME=lamp
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
    "version": "5.6",
    "via": "apache",
    "webroot": "www",
    "urls": [
      "https://localhost:32839",
      "http://localhost:32840",
      "http://lamp2.lndo.site",
      "https://lamp2.lndo.site"
    ],
    "share": {
      "remote": "/var/www/html"
    }
  },
  "database": {
    "type": "mysql",
    "version": "latest",
    "creds": {
      "user": "lamp",
      "password": "lamp",
      "database": "lamp"
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

Options:
  --help, -h  Show help                                                [boolean]

Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output

You need at least one command before moving on
```
