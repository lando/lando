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
