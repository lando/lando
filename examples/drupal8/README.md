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
