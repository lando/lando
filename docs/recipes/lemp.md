LEMP
====

[LEMP](https://lemp.io/) is a popular [LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) variant that replaces `apache` with `nginx`. It specifically means **L**inux, **(E)**nginx **M**ySQL and **P**HP.

You can easily boot up a LEMP stack for your app by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: lemp
```

You can easily configure/override the LEMP recipe and add in additional `.lando.yml` config such as `services`, `tooling`, and `proxy setting`.

Example
-------

{% codesnippet "./../examples/lemp2/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/lemp2).

Environment Variables
---------------------

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
DB_HOST=database
DB_USER=lemp
DB_PASSWORD=lemp
DB_NAME=lemp
DB_PORT=3306
```

Getting Service Information
---------------------------

You can get more in-depth information about the services this recipe provides by running `lando info`.

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
    "version": "7.1",
    "via": "nginx",
    "webroot": "."
  },
  "nginx": {
    "urls": [
      "https://localhost:32843",
      "http://localhost:32844",
      "http://lemp2.lndo.site",
      "https://lemp2.lndo.site"
    ]
  },
  "database": {
    "type": "mariadb",
    "version": "10.1",
    "creds": {
      "user": "lemp",
      "password": "lemp",
      "database": "lemp"
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

You can get more in-depth information about the tooling this recipe provides by running `lando`.

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
  yarn                     Run yarn commands
  gulp                     Run gulp commands
  node                     Run node commands
  npm                      Run npm commands
  composer                 Run composer commands
  php                      Run php commands
  mysql                    Drop into a MySQL shell

Global Options:
  --help, -h  Show help
  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output

You need at least one command before moving on
```
