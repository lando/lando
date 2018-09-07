PHP Nginx Services Example
==========================

This example provides a very basic `LEMP` application using Lando services instead of a recipe.

See the `.lando.yml` in this directory for PHP configuration options.

Start me up!
------------

Run the following steps to get up and running with this example.

```bash
# Starts up a LEMP stack using lando services
lando start
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run LEMP dev tools
lando php -v
lando composer
lando mysql
# This should fail
lando phplint

# Run NODE dev tools
lando node -v
lando npm -v
```

Verify things are in order
--------------------------

Run these commands to make sure things are right as rain.

```bash
# Verifies that true exists in the appserver
# @todo: replace this with something that makes sense
lando ssh -c "true"
```

Blowup the app
--------------

Run these commands to ensure we clean things up.

```bash
# Destroys the LAMP stack
lando destroy -y
```
