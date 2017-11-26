Events Example
==============

This example provides basic Lando events handling via a simple LEMP stack.

See the `.lando.yml` in this directory for events configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Start the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Test the post-start event
lando start | grep "App restarted"

# Test the custom post-test event
lando test
lando test | grep "runs after test"
```
