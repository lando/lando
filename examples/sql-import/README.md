SQL Import Example
==================

Lando ships with a helper `db-import` script that is available in all our `LAMP` and `LEMP` based recipes. Used in the recipe context it should import a database dump into the recipe-provided database by default but can be used on additional database services as well.

You can also import databases into other hosts and databases. It will currently handle uncompressed, gzipped or zipped dump files.

**This command will wipe out the target database before it runs the import unless you use the `--no-wipe` flag!**

Usage
-----

```bash
lando db-import somedumpfile.sql.gz
```

Prefer video tutorials?
{% youtube %}
https://www.youtube.com/watch?v=KH_wZuaPeRc
{% endyoutube %}

> #### Warning::DB dump must reside within app directory
>
> Due to restrictions in how Docker handles file sharing your database dump **MUST** exist somewhere inside of your app directory. This means that **IT IS A VERY GOOD IDEA** to make sure you add SQL dumps to your `.gitignore` file.

### Examples

```bash
# Import a file into the recipe-provided db
lando db-import dump.sql

# Import a file into an auxiliary second database called 'db2'
# with a db called `dataz`
lando db-import dump.zip --host db2

# Import without destroying the target database
lando db-import dump.zip --no-wipe

# Pipe stdout into db-import
# NOTE: this is a bit finicky right now
cat dump.sql | lando db-import
```

### Options

```bash
Options:
  --host, -h      The database service to use                  [default: "database"]
  --no-wipe       Do not destroy the existing database before an import
```

Adding the `db-import` command
------------------------------

If you are not using one of our `php`-y recipes you can add the `db-import` command and default options to your `.lando.yml` as follows.


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/sql-import).
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

# Verify that after a rebuild we still have the data tables
lando rebuild -y
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
