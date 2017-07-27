Working with LAMP
=================

Lando offers a [recipe](./../recipes/lamp.md) for spinning up apps that use the [LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) stack, a common infrastructure designed to run PHP applications. Note that you'll only want to use this recipe if you have a custom PHP application not supported by one of Lando's other recipes. Let's go over some basic usage.

Getting Started
---------------

Before you can use all the awesome Lando magic you need a codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...


### 1. Start with an existing codebase

```bash
# Clone codebase from git, un-tar codebase, receive as gift from the gods, etc.
git clone https://private-repository.com/lamp-project.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
# NOTE: You will need to choose the same site you cloned
lando init mysite --recipe lamp
```

### 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite

# Initialize a LAMP .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.lndo.io/cli/init.html#github
lando init mysite github --recipe lamp
```

Starting Your Site
------------------

Once you've completed the above you should be able to start your LAMP site.

```bash
lando start
```

If you vist any of the green-listed URLS that show up afterwards you should be welcomed with either the Drupal, Backdrop or WordPress installation screens. Read below on how to import your database and file.

Importing Your Database
-----------------------

If you have an existing database for your application, you can easily import it:

```bash
lando db-import my-db.sql --database=lamp
```

Other Helpful Things
--------------------

The LAMP recipe comes pre-loaded with a few handy commands:

```bash
# Download a dependency with composer
lando composer require guzzlehttp/guzzle

# Access MySQL CLI
lando mysql
```

Check out our [LAMP Recipe](./../recipes/lamp.md) for details on more advanced usage.

Configuration
-------------

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
DB_HOST=database
DB_USER=lamp
DB_PASSWORD=lamp
DB_NAME=lamp
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
    ]
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
