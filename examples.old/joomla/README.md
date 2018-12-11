Joomla Recipe Example
=====================

This example provides a very basic `joomla` recipe example.

See the `.lando.yml` in this directory for Joomla configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Download a Joomla release into the web directory
# NOTE: Probably want to replace with the latest release
# See: https://downloads.joomla.org/us/cms/joomla3
curl -L https://downloads.joomla.org/cms/joomla3/3-8-6/Joomla_3-8-6-Stable-Full_Package.tar.gz | tar zxv -C web

# Spin up a new laravel site
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

# Run joomla console commands
cd web
lando joomla
```
