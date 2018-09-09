Drupal 7 Composer Recipe Example
================================

This example provides a very basic `drupal7` recipe example that is installed via Composer.

See the `.lando.yml` in this directory for Drupal 7 configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Install Drupal 7 with composer
lando composer install

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
```

Bootup
------

Start up the Drupal 7 example app

```bash
# Start the Drupal 7 example recipe
lando start
```

Testing
-------

Test the Drupal 7 example

```bash
# Test downloading Drupal 7 code via composer
lando composer install

# Test that we got a drupal 7 codebase
lando ssh -c "ls web |grep index.php"

# Test removing a database
lando ssh -c "mysql -udrupal7 -pdrupal7 -h database -e \'drop database if exists drupal7;\'"

# Test creating a database
lando ssh -c "mysql -udrupal7 -pdrupal7 -h database -e \'create database if not exists drupal7;\'"

# Test installing Drupal 7 via drush
lando ssh -c "cd web && drush si --db-url=mysql://drupal7:drupal7@database/drupal7 -y"

# Test that we can visit the homepage
HP="No front page content has been created yet"
lando ssh -c "curl appserver |grep $HP"
```

Cleanup
-------

Remove the test app

```bash
# Destroy the test app
lando destroy -y
```
