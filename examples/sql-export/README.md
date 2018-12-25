SQL Export Example
====================

This example provides a very basic `db-export` example built on Lando php services.

See the `.lando.yml` in this directory for `db-export` configuration options.

Start the example
-----------------

Run the following commands to get up and running with this example.

```bash
# Boot up a sql-export example
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

# Export the contents of the dbs
lando db-export
lando db-export -h database2
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

# Export the contents of the dbs
lando db-export
lando db-export -h database2

# Verify the expected export dumps are there
cat data1.*.gz
cat database.*.gz
```

Destroying the example
----------------------

Run the following commands to destroy

```bash
# Remove the exported DBs
rm -f data1.*.gz
rm -f database.*.gz

# Blow up the sql-export example
lando destroy -y
```
