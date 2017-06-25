Larvel
======

[Laravel](https://laravel.com/) is a free, open-source PHP web framework, created by Taylor Otwell and intended for the development of web applications following the model–view–controller (MVC) architectural pattern. It is the Ruby-on-Rails of PHP.

You can easily boot up a best practices stack to run and develop Laravel by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: laravel
```

You can easily configure/override the Larvel recipe and add in additional `.lando.yml` config such as `services`, `tooling`, and `proxy setting`.

Example
-------

{% codesnippet "./../examples/laravel/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/laravel)

Installing Laravel
------------------

```bash
# Get the lando example
git clone https://github.com/kalabox/lando.git
cd lando/examples/laravel

# Start the app up
lando start

# Create a new laravel project in the site folder
lando laravel new site

# Move new site one level up
mv -f site/* ./
cp -rf site/.* ./
rm -rf site

# Visit https://laravel.lndo.site.

# Check site with artisan
lando artisan env
```

Environmental Variables
-----------------------

Lando will add some helpful environmental variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
# Cache
CACHE_HOST: index
CACHE_PORT: 6379

# Database
DB_HOST=database
DB_USER=laravel
DB_PASSWORD=laravel
DB_NAME=laravel
DB_PORT=3306
```

Note that these can be vary based on the choices you make in your recipe config.

### Getting Service Information

You can get more in depth information about the services this recipe provides by running `lando info`

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "appserver": {
    "type": "php",
    "version": "7.0",
    "via": "nginx",
    "webroot": "public",
    "config": {
      "server": "/Users/pirog/.lando/services/config/laravel/laravel.conf",
      "conf": "/Users/pirog/.lando/services/config/laravel/php.ini"
    }
  },
  "nginx": {
    "urls": [
      "https://localhost:33125",
      "http://localhost:33126",
      "http://laravel.lndo.site",
      "https://laravel.lndo.site"
    ]
  },
  "database": {
    "type": "mariadb",
    "version": "10.1",
    "creds": {
      "user": "laravel",
      "password": "laravel",
      "database": "laravel"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": "33123"
    },
    "config": {
      "confd": "/Users/pirog/.lando/services/config/laravel/mysql"
    }
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
      "port": "33124"
    }
  },
  "node": {
    "type": "node",
    "version": "6.10"
  }
}
```

Getting Tooling Information
---------------------------

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
  composer                 Run composer commands
  php                      Run php commands
  mysql                    Drop into a MySQL shell
  artisan                  Run artisan commands
  laravel                  Run laravel commands
  node                     Run node commands
  npm                      Run npm commands

Options:
  --help, -h  Show help                                                [boolean]

Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output

You need at least one command before moving on
```
