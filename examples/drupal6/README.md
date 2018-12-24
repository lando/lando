Drupal 6 Recipe Example
=======================

This example provides a very basic `drupal6` recipe example.

See the `.lando.yml` in this directory for Drupal 6 configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Get drupal6
# NOTE: Probably want to replace with the latest release
# See: https://www.drupal.org/project/drupal/releases?api_version%5B%5D=87
curl -fsSL "https://ftp.drupal.org/files/projects/drupal-6.38.tar.gz" | tar -xz --strip 1 -C ./web

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
lando drush status
```
