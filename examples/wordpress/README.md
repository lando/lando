WordPress Composer Example
==========================

This example provides a Composer powered spin up of a WordPress site.

See the `.lando.yml` in this directory for WordPress configuration options.

ONE
-------

You should be able to run the following steps to get up and running with this example.

```bash
# Install dependencies with Composer
# Do some other stuff that doesnt matter
lando composer install

# Start up the example
lando start
```

TWO
-------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get service (eg database) connection info
lando info

# Run WP-cli commands
lando wp --version
true
```

THREE
-------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Destroy the example
lando destroy -y
```
