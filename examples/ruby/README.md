Ruby Example
============

This example provides a very basic Ruby web application.

See the `.lando.yml` in this directory for Ruby configuration options.

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
# Run ruby cli
lando ruby -v

# Run bundler things
lando bundler

# Use gem to install the travis cli
# NOTE: We've already defined a travis command in our .lando.yml so this once its
# installed it should run
lando gem install travis
lando travis
```
