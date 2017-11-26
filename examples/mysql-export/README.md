MySQL Export Example
====================

This example provides a very basic `mysql-export` example built on Lando php services.

See the `.lando.yml` in this directory for `mysql-export` configuration options.

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

# Import the test db
lando db-import test.sql

# See export options
lando db-export -- --help

# Drop into a mysql shell on the target DB
lando mysql

# Verify that we have a 'users' table
# NOTE: This will only work if the auto-import on Lando start was successful
lando mysql -e "show tables;"

# Export the contents of the db
lando db-export
```
