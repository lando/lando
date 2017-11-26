PHP Apache Services Example
===========================

This example provides a very basic `LAMP` application using Lando services instead of a recipe.

See the `.lando.yml` in this directory for PHP configuration options.

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

# Run LAMP dev tools
lando php -v
lando composer
lando mysql
```
