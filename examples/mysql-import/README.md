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

# See mysql import options
lando mysql -- --help
lando db-import -- --help

# Drop into a mysql shell on the default db
lando mysql

# Drop into a mysql shell on the secondary database
lando mysql -h database2

# Import the test mysql file against the default database
lando db-import test.sql

# Import the test mysql file to the secondary database
lando db-import -h databse2 test.sql

# Verify that we have a 'users' table on both databases
# NOTE: This will only work if you've `lando db-import test.sql`
lando mysql data1 -e "show tables;"
lando mysql -h database2 database -e "show tables;"
```
