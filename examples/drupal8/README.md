Drupal 8 Composer Recipe Example
================================

This example provides a very basic `drupal8` recipe example that is installed via Composer.

See the `.lando.yml` in this directory for Drupal 8 configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Install Drupal 8 with composer
lando composer install
lando composer drupal-scaffold

# Start up the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run drush commands
cd web
lando drush status

# Run console commands
cd web
lando drupal
```

Bootup
------

Start up the Drupal 8 example recipe

```bash
# Start the Drupal 8 example recipe
if [ -d "web" ]; then rm -Rf web; fi
if [ -d "vendor" ]; then rm -Rf vendor; fi
lando start
lando composer install
lando composer drupal-scaffold
```

Testing
-------

Test the Drupal 8 example

```bash
# Test that we got a drupal 8 codebase
lando ssh -c "ls web |grep index.php"

# Test removing a database
lando ssh -c "mysql -udrupal8 -pdrupal8 -h database -e \'drop database if exists drupal8;\'"

# Test creating a database
lando ssh -c "mysql -udrupal8 -pdrupal8 -h database -e \'create database if not exists drupal8;\'"

# Test installing Drupal 8 via drush
lando ssh -c "cd web && drush si --db-url=mysql://drupal8:drupal8@database/drupal8 -y"

# Test that we can visit the homepage
lando ssh -c "curl nginx |grep \'No front page content has been created yet.\'"
```

Cleanup
-------

Remove the test app

```bash
# Destroy the test app
lando destroy -y
```
