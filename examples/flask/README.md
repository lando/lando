Flask Example
=============

This example provides a very basic `flask` web server.

See the `.lando.yml` in this directory for Python configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Install python deps
lando pip install -r requirements.txt

# Start the example
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

# Use deps installed via lando pip install -r requirements.txts
# NOTE: We've already defined these in our .lando.yml so once they installed it should run
lando flask
lando livereload
```
