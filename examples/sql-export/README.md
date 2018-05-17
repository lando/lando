SQL Export Example
====================

This example provides a very basic `db-export` example built on Lando php services.

See the `.lando.yml` in this directory for `db-export` configuration options.

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

# Import the test db to both databases
lando db-import test.sql
lando db-import -h database2 test2.sql

# See export options
lando db-export -- --help

# Verify that we have a 'users' table on both databases
# NOTE: This will only work if you've run `lando db-import test.sql` already
lando mysql data1 -e "show tables;"
# NOTE: This will only work if you've run `lando db-import -h database2 test2.sql` already
lando psql -h database2 database -c "\dt"

# Export the contents of the dbs
lando db-export
lando db-export -h database2
```
