Backdrop Recipe Example
=======================

This example provides a very basic `backdrop` recipe example.

See the `.lando.yml` in this directory for Backdrop configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Get backdrop
# NOTE: Probably want to replace with the latest release
# See: https://github.com/backdrop/backdrop/releases
curl -fsSL "https://github.com/backdrop/backdrop/archive/1.9.2.tar.gz" | tar -xz --strip 1 -C ./www

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

# Run Backdrop drush commands
# You need to install Backdrop before you can do this
cd www
lando drush status
```
