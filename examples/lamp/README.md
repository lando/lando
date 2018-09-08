PHP Apache Services Example
===========================

This example provides a very basic `LAMP` application using Lando services instead of a recipe.

See the `.lando.yml` in this directory for PHP configuration options.

This is the dawning of the age of LAMPquarius
---------------------------------------------

Run the following steps to get up and running with this example.

```bash
# Starts up a LAMP stack using lando services
lando start
```

Helpful commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run LAMP dev tools
lando php -v
lando composer
lando mysql
```

Sanity checks
-------------

Run these commands to make sure things are right as rain.

```bash
# Verifies that true exists in the appserver
# @todo: replace this with something that makes sense
lando ssh -c "true"
```

Nuke the whole god damn thing
-----------------------------

Run these commands to ensure we clean things up.

```bash
# Destroys the LAMP stack
lando destroy -y
```
