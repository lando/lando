Getting Started
===============

Start with an existing codebase
-------------------------------

Generally you will want to start by pulling down an existing codebase for a site with `git`, extracting an archive of a codebase or switching to a directory that contains the code for your app. For these getting started examples we will assume we are already in a directory with the following contents and structure.

**Directory Structure**

```bash
./
|-- index.php
```

**index.php Contents**
```php
<?php

phpinfo();

?>
```

> #### Info::Does not need to be PHP
>
>  You can use Lando for [more than just php projects](./../config/services.md)

Choose a recipe
---------------

Choose a [recipe](./../config/recipes.md) that is closest to the kind of app you want to run and create a `.lando.yml` file in the root of your app directory. In this example we will start with the [LAMP](./../recipes/lamp.md) recipe.

```yml
name: myapp
recipe: lamp
```

Start your app
--------------

```bash
# Start up your app
lando start
Creating network "myapp_default" with the default driver
Creating volume "myapp_appserver" with default driver
Creating volume "myapp_data" with default driver
Creating myapp_appserver_1
Creating myapp_database_1
Creating myapp_unisonappserver_1
Recreating lando_proxy_1

BOOMSHAKALAKA!!!

Your app has started up correctly.
Here are some vitals:

 NAME      myapp
 LOCATION  /Users/pirog/Desktop/work/lando/examples/started
 SERVICES  appserver, database, unisonappserver
 URLS      https://localhost:32778
           http://localhost:32779
           http://myapp.lndo.site
           https://myapp.lndo.site
```

You can now access your app (in this case just the php info) on any of the accessible (eg green) urls specified!

Discover Services
-----------------

Run `lando info` to see what [services](./../config/services.md) ship with your recipe. You should see that the `lamp` recipe spins up an `appserver` and `database` for use **WITH ONLY THIS APP**. You also will notice that you get some nice additional information about your services such as the database credentials and connection info.

```bash
lando info

"appserver": {
  "type": "php",
  "version": "7.1",
  "via": "apache",
  "webroot": ".",
  "urls": [
    "https://localhost:32801",
    "http://localhost:32802",
    "http://myapp.lndo.site",
    "https://myapp.lndo.site"
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
```

Use Tooling
-----------

Run `lando` to see if any additional [tooling](./../config/tooling.md) commands are now available. You should see that `lando composer`, `lando php` and `lando mysql` are now all available for you to use **WITH ONLY THIS APP**. Try them out!

```bash
# Get the version of php this app is using
lando php -v

# Interactively install a dependency with composer
lando composer require

# Drop into a shell on the mysql database
lando mysql

# Check which webserver we are using
lando ssh -c "curl appserver" | grep SERVER_SOFTWARE
```
