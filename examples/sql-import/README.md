SQL Import Example
==================

This example provides a very basic `db-import` example built on Lando php services.

See the `.lando.yml` in this directory for `db-import` configuration options.

Start the example
---------------

Run the following commands to get up and running with this example.

```bash
# Boot up a sql-import example
lando start
```

Testing the example
-------------------

```bash
# Verify the databases are up and good
lando ssh database -c "mysql -umysql -pmysql data1 -e\"quit\""
lando ssh database2 -c "psql -U postgres database -c \'\\\dt\'"

# Verify our dynamic commands work
lando psql -h database2 -V
lando mysql -V

# Import the test mysql file against the default database
lando db-import test.sql

# Import the test postgres file to the secondary database
lando db-import -h database2 test2.sql

# Verify that we have a 'users' table on both databases
lando ssh database -c "mysql -u mysql -pmysql data1 -e \'show tables;\' | grep users"
lando ssh database2 -c "psql -U postgres -h database2 database -c \'\\\dt\' | grep users"
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
```

Destroying the example
----------------------

Run the following commands to destroy

```bash
# Blow up the sql-import example
lando destroy -y
```
