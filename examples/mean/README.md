MEAN Example
============

This example provides a very basic `mean` recipe example.

See the `.lando.yml` in this directory for `mean` configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Install the node deps
lando npm install

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

# Run node commands
lando npm -v
lando node -v
lando yarn -v
lando gulp -v

# Drop into the mongo cli
lando mongo
```
