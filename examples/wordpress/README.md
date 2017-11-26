WordPress Composer Example
==========================

This example provides a Composer powered spin up of a WordPress site. See the `.lando.yml` in this directory for configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Install dependencies with Composer
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
# Get service (eg database) connection info
lando info

# Run WP-cli commands
lando wp
```
