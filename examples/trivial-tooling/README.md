Tooling Example
===============

This example provides a basic example of Lando tooling using a LEMP stack with node cli tools.

See the `.lando.yml` in this directory for tooling configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Install node dependencies
lando npm install

# Install php dependencies
# NOTE: This is also set up to auto-run on lando start, see .lando.yml
lando composer install

# Start up the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Run npm commands as defined in .lando.yml
lando npm -v

# Run composer commands defined .lando.yml
# This will run the composer test script (this should fail)
lando test

# Run a custom command called `word` that has options and delegates to an injected script
# Check out options for lando word
lando word -- -h

# Interactively determine what the word is
lando word

# Non-interactively determine the word
lando word --word=bird
```
