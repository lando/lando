Drupal 7 Services Example
=========================

This example provides a very basic `drupal7` example using Lando services and not a recipe.

See the `.lando.yml` in this directory for Drupal 7 configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
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
cd www
lando drush status

# Run NODE dev tools
lando node -v
lando npm -v
lando grunt -v
```
