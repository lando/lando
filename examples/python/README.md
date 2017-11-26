Python Example
==============

This example provides a very basic `python` web server.

See the `.lando.yml` in this directory for Python configuration options.

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
# Run python dev tools
lando python --version
lando pip
lando easy_install
lando pyvenv

# Use pip to install the livereload cli
# NOTE: We've already defined a travis command for this in our .lando.yml so
# once its installed it should run
lando pip install livereload
lando livereload
```
