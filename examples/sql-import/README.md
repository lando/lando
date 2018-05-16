SQL Import Example
==================

This example provides a very basic `db-import` example built on Lando php services.

See the `.lando.yml` in this directory for `db-import` configuration options.

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

# See mysql import options
lando mysql -- --help
lando db-import -- --help

# Drop into a mysql shell on the default db
lando mysql

# Drop into a postgres shell on the secondary database
lando psql -h database2

# Import the test mysql file against the default database
lando db-import test.sql

# Import the test postgres file to the secondary database
lando db-import -h database2 test2.sql

# Verify that we have a 'users' table on both databases
# NOTE: This will only work if you've run `lando db-import test.sql` already
lando mysql data1 -e "show tables;"
# NOTE: This will only work if you've run `lando db-import -h database2 test2.sql` already
lando psql -h database2 database -c "\dt"
```
