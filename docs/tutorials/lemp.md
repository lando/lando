Working with LEMP
=================

Lando offers a [recipe](./../recipes/lemp.md) for spinning up apps that use the [LEMP](https://lemp.io/) stack, a popular [LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) variant that replaces the `apache` webserver with `nginx`.


Getting Started
---------------

Before you can use all the awesome Lando magic you need a codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...


### 1. Start with an existing codebase

```bash
# Clone codebase from git, un-tar codebase, receive as gift from the gods, etc.
git clone https://private-repository.com/lemp-project.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
# NOTE: You will need to choose the same site you cloned
lando init mysite --recipe lemp
```

### 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite

# Initialize a LEMP .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.lndo.io/cli/init.html#github
lando init mysite github --recipe lemp
```

Starting Your Site
------------------

Once you've completed the above you should be able to start your LEMP site.

```bash
lando start
```

If you visit any of the green-listed URLS that show up afterwards you should be presented with whatever content is rendered by your `index.php`. Read below on how to import your database.

Importing Your Database
-----------------------

If you have an existing database for your application, you can easily import it:

```bash
lando db-import my-db.sql --database=lemp
```

Other Helpful Things
--------------------

The LEMP recipe comes pre-loaded with a few handy commands:

```bash
# Download a dependency with composer
lando composer require guzzlehttp/guzzle

# Access MySQL CLI
lando mysql
```

Check out our [LEMP Recipe](./../recipes/lemp.md) for details on more advanced usage.

Configuration
-------------

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via PHP's [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
DB_HOST=database
DB_USER=mariadb
DB_PASSWORD=password
DB_NAME=database
DB_PORT=3306
```

Advanced Service Usage
-----------------------

You can get more in-depth information about the services this recipe provides by running `lando info`. See the [services](../config/services.md) for details on how to add more services or further customize these existing ones.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "appserver": {
    "type": "php",
    "version": "7.1",
    "via": "nginx",
    "webroot": "www",
    "config": {
      "server": "config/nginx/default.conf",
      "conf": "config/php/php.ini"
    }
  },
  "nginx": {
    "urls": [
      "https://localhost:32876",
      "http://localhost:32877",
      "http://lemp.lndo.site",
      "https://lemp.lndo.site"
    ]
  },
  "database": {
    "type": "mariadb",
    "version": "latest",
    "creds": {
      "user": "mariadb",
      "password": "password",
      "database": "database"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": "3332"
    },
    "config": {
      "confd": "config/mysql"
    }
  },
  "node": {
    "type": "node",
    "version": "6.10"
  }
}
```
