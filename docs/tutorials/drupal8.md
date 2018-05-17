Working with Drupal 8
=====================

Lando offers a configurable recipe for spinning up [Drupal 8](https://drupal.org/) apps. Let's go over some basic usage.

<!-- toc -->

Getting Started
---------------

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../installation/system-requirements.md)
2. [Read up on how to get a `.lando.yml`](./../started.md)

If after reading #2 above you are still unclear how to get started then try this

```bash
# Go into a local folder with your site or app codebase
# You can get this via git clone or from an archive
cd /path/to/my/codebase

# Initialize a basic .lando.yml file for my recipe with sane defaults
lando init

# Commit the .lando.yml to your git repo (Optional but recommended)
git add -A
git commit -m "Adding Lando configuration file for easy and fun local development!"
git push
```

For more info on how `lando init` works check out [this](./../cli/init.md).

Starting Your Site
------------------

Once you've completed the above you should be able to start your Drupal 8 site.

```bash
# Start up app
lando start

# List information about this app.
lando info

# Optionally run composer install if needed
lando composer install
```

If you visit any of the green-listed URLs that show up afterwards you should be welcomed with the Drupal 8 installation screen.

If you are installing Drupal 8 from scratch will also want to scope out your database credentials by running `lando info` so you can be prepped to enter them during the drupal installation. You will want to use `internal_connection` information. Note that you will likely have to open up the `Advanced Settings` during the Drupal 8 database configuration to change the hostname.

Or you can read below on how to import your database.

Importing Your Database
-----------------------

Once you've started up your Drupal 8 site you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

```bash
# Go into my app
cd /path/to/my/app

# Grab your database dump
curl -fsSL -o database.sql.gz "https://url.to.my.db/database.sql.gz"

# Import the database
# NOTE: db-import can handle uncompressed, gzipped or zipped files
# Due to restrictions in how Docker handles file sharing your database
# dump MUST exist somewhere inside of your app directory.
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./db-import.md).

Tooling
-------

Each Lando Drupal 8 recipe will also ship with helpful dev utilities. This means you can use things like `drush`, `drupal`, `composer` and `php-cli` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer                 Run composer commands
lando db-import <file>         Import <file> into database. File is relative to approot.
lando db-export                Export a database. Resulting file: {DB_NAME}.TIMESTAMP.gz
lando drupal                   Run drupal console commands
lando drush                    Run drush commands
lando mysql                    Drop into a MySQL shell
lando php                      Run php commands
```

```bash
# Check the status of your site with drush
lando drush status

# Init with the drupal console
lando drupal init

# Run composer install
lando composer install

# Drop into a mysql shell
lando mysql

# Check the app's php version
lando php -v
```

You can also run `lando` from inside your app directory for a complete list of commands.

Drush
-----

By default our Drupal 8 recipe will globally install the [latest version of the Drush Launcher](https://github.com/drush-ops/drush-launcher). This means that it is up to the user to [list Drush as a dependency](http://docs.drush.org/en/master/install/#install-a-site-local-drush-and-drush-launcher) in their site's `composer.json` and to `lando composer install`. **If you do not do this then you will get an error from the Drush Launcher indicating you need to install Drush.**

If you are not running your Drupal 8 project with `composer` you can [easily change](#configuration) the Drush installation behavior to install Drush globally like we do in our Drupal 7 recipe.

If you are using a nested webroot you will need to `cd` into your webroot and run `lando drush` from there. This is because many site-specific `drush` commands will only run correctly if you run `drush` from a directory that also contains a Drupal site.

To get around this you might want to consider overriding the `drush` tooling command in your `.lando.yml` so that Drush can detect your nested Drupal site from your project root. Note that hardcoding the `root` like this may have unforeseen and bad consequences for some `drush` commands such as `drush scr`.

```yml
tooling:
  drush:
    service: appserver
    cmd:
      - "drush"
      - "--root=/app/PATH/TO/WEBROOT"
```

### URL Setup

To set up your environment so that commands like `lando drush uli` return the proper URL, you will need to configure Drush.

Create or edit the relevant `settings.php` file and add these lines. Note that you may need to specify a port depending on your Lando installation. You can run `lando info` to see if your URLs use explicit ports or not.

```php
// Set the base URL for the Drupal site.
$options['uri'] = "http://mysite.lndo.site:PORT";
```

### Aliases

You can also use drush aliases with command like `lando drush @sitealias cc all` by following the instructions below.

Make sure the alias file exists within the drush folder in your app.
An example could be the files structure below.

```
/app
  /drush
    yoursite.aliases.drushrc.php
```

For info on how to setup your alias please refer to the following [link](https://www.drupal.org/node/1401522) or see this [example](https://raw.githubusercontent.com/drush-ops/drush/master/examples/example.aliases.yml).

and by adding the following example to your .lando.yml file:

```yaml
services:
  appserver:
    run:
      - "mkdir -p ~/.drush/site-aliases"
      - "ln -sf /app/drush/yoursite.aliases.drushrc.php ~/.drush/site-aliases/yoursite.drushrc.php"
 ```

Depending on your file structure and alias name the `.lando.yml` file should change accordingly.

Please refer the [ssh section](./../cli/ssh.html)if you need to set-up keys that require a passphrase.

Configuration
-------------

### Recipe

You can also manually configure the `.lando.yml` file to switch `php` or `drush` versions, toggle between `apache` and `nginx`, activate `xdebug` or `drupal` console, choose a database type and version, set a custom webroot locaton and use your own configuration files.

{% codesnippet "./../examples/drupal8/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/drupal8).

### Environment Variables

The below are in addition to the [default variables](./../config/services.md#environment) that we inject into every container. These are accessible via `php`'s [`getenv()`](http://php.net/manual/en/function.getenv.php) function.

```bash
# The below is a specific example to ILLUSTRATE the KINDS of things provided by this variable
# The content of your variable may differ
LANDO_INFO={"appserver":{"type":"php","version":"7.1","hostnames":["appserver"],"via":"nginx","webroot":"web","config":{"server":"/Users/pirog/.lando/services/config/drupal8/drupal8.conf","conf":"/Users/pirog/.lando/services/config/drupal8/php.ini"}},"nginx":{"type":"nginx","version":"1.13","hostnames":["nginx"],"webroot":"web","config":{"server":"/Users/pirog/.lando/services/config/drupal8/drupal8.conf","conf":"/Users/pirog/.lando/services/config/drupal8/php.ini"}},"database":{"type":"mysql","version":"5.7","hostnames":["database"],"creds":{"user":"drupal8","password":"drupal8","database":"drupal8"},"internal_connection":{"host":"database","port":3306},"external_connection":{"host":"localhost","port":true},"config":{"confd":"/Users/pirog/.lando/services/config/drupal8/mysql"}}}
```

**NOTE:** These can vary based on the choices you make in your recipe config.
**NOTE:** See [this tutorial](./../tutorials/lando-info.md) for more information on how to properly use `$LANDO_INFO`.

### Automation

You can take advantage of Lando's [events framework](./../config/events.md) to automate common tasks. Here are some useful examples you can drop in your `.lando.yml` to make your Drupal 8 app super slick.

```yml
events:

  # Clear caches after a database import
  post-db-import:
    - appserver: cd $LANDO_WEBROOT && drush cr -y

  # Runs composer install and a custom php script after your app starts
  post-start:
    - appserver: cd $LANDO_MOUNT && composer install
    - appserver: cd $LANDO_WEBROOT && php script.php

```

Advanced Service Usage
----------------------

You can get more in-depth information about the services this recipe provides by running `lando info`.

Read More
---------

### Workflow Docs

*   [Using Composer to Manage a Project](http://docs.devwithlando.io/tutorials/composer-tutorial.html)
*   [Lando and CI](http://docs.devwithlando.io/tutorials/lando-and-ci.html)
*   [Lando, Pantheon, CI, and Behat (BDD)](http://docs.devwithlando.io/tutorials/lando-pantheon-workflow.html)
*   [Killer D8 Workflow with Platform.sh](https://thinktandem.io/blog/2017/10/23/killer-d8-workflow-using-lando-and-platform-sh/)

### Advanced Usage

*   [Adding additional services](http://docs.devwithlando.io/tutorials/setup-additional-services.html)
*   [Adding additional tooling](http://docs.devwithlando.io/tutorials/setup-additional-tooling.html)
*   [Adding additional routes](http://docs.devwithlando.io/config/proxy.html)
*   [Adding additional events](http://docs.devwithlando.io/config/events.html)
*   [Setting up front end tooling](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Accessing services (eg your database) from the host](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Importing SQL databases](http://docs.devwithlando.io/tutorials/db-import.html)
*   [Exporting SQL databases](http://docs.devwithlando.io/tutorials/db-export.html)

### Setting up PHPStorm for running tests
We want to be able to run PHPUnit, Kernel and Functional Test with PHPStorm instead by Commandline so we can debug our
tests. We want to be able to do this by the FPM from our lando app. To do this we need to setup a Remote interpreter
and make out Test Framework us it.

* *Currently we have issues running functional test through PHPStorm. The reason this doesn't work yet is
 that PHPStorm spins up a container and *

#### MacOS

##### 1. Docker integration.
Go to "Preferences" >> "Build, Execution, Deployment" >> "Docker". Click on the "+" and simply select "Docker for Mac".

##### 2. Remote CLI interpreter.
Go to "Preferences" >> "Languages and Framework" >> "PHP". Click on the "..." for the CLI interpreter and in the
pop-up window add a new interpreter by clicking on the "+". Select "From Docker, Vagrant, VM, Remote..". In the next
window select "Docker". This should automatically fill with the FPM container from lando. See for example:

![Add remote interpreter for docker](https://raw.githubusercontent.com/lando/lando/master/docs/images/add-remote-interpreter-docker.png)

##### 3. Test Frameworks
Go to "Preferences" >> "Languages and Framework" >> "PHP" >> "Test Frameworks". Click on the "+" and select
"PHPUnit by Remote interpreter". Select the CLI interpreter from Step 2. All we need to do is target the "autoload.php"
within our container and the "Default configuration / bootstrap" file:

![Add remote interpreter for docker](https://raw.githubusercontent.com/lando/lando/master/docs/images/test-frameworks-remote-interperter)

#### Setup phpunit.xml variables
Note that for SIMPLETEST_DB we target the "tmp" directory this is done because we spin up a container and we need write
 permissions to create the sqlite file.
```xml
<php>
    <!-- Set error reporting to E_ALL. -->
    <ini name="error_reporting" value="32767"/>
    <!-- Do not limit the amount of memory tests take to run. -->
    <ini name="memory_limit" value="-1"/>
    <!-- Example SIMPLETEST_BASE_URL value: http://localhost -->
    <env name="SIMPLETEST_BASE_URL" value="http://domainname.localhost/"/>
    <!-- Example SIMPLETEST_DB value: mysql://username:password@localhost/databasename#table_prefix -->
    <env name="SIMPLETEST_DB" value="sqlite://tmp/test.sqlite"/>
    <!-- Example BROWSERTEST_OUTPUT_DIRECTORY value: /path/to/webroot/sites/simpletest/browser_output -->
    <env name="BROWSERTEST_OUTPUT_DIRECTORY" value="/opt/project/web/sites/default/files/browser_output"/>
  </php>
```
