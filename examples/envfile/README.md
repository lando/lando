.env Example
============

This example uses a basic LEMP stack to showcase `.env` file injection.

See the `.env` in this directory.

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
# Verify the envvar injection
lando info --deep | grep TAYLOR
```
