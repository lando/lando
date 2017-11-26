Laravel Recipe Example
======================

This example provides a very basic `laravel` recipe example.

See the `.lando.yml` in this directory for Laravel configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Start up the example
# NOTE: This will take awhile and ultiamtely show red URLs the first time you
# do it but we need it to install the laravel-installer package for the next step
lando start

# Spin up a new laravel site
lando laravel new web

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run artisan commands
cd web
lando artisan

# Run laravel commands
lando laravel
```
