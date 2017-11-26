MySQL Import Example
====================

This example provides a very basic `mysql-import` example built on Lando php services.

See the `.lando.yml` in this directory for `mysql-import` configuration options.

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

# See import options
lando db-import -- --help

# Import the test mysql file
lando db-import test.sql

# Drop into a mysql shell on the target DB
lando mysql

# Verify that we have a 'users' table
# NOTE: This will only work if you've `lando db-import test.sql` first
lando mysql -e "show tables;"
```
