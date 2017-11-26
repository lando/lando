Services Example
================

This example provides an `nginx` webserver and showcases some basic service overrides.

See the `.lando.yml` in this directory for services configuration options.

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
# Verify that port 8080 was set
lando info | grep 8080

# Verify that the custom config file was set
lando info --deep | grep config/server.conf

# Verify that the custom THING env was set
lando info --deep | grep THING
```
