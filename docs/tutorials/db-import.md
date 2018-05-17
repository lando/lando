Importing Databases
===================

Lando ships with a helper `db-import` script that is available in all our `LAMP` and `LEMP` based recipes. Used in the recipe context it should import a database dump into the recipe-provided database by default but can be used on additional database services as well.

You can also import databases into other hosts and databases. It will currently handle uncompressed, gzipped or zipped dump files.

**This command will wipe out the target database before it runs the import unless you use the `--no-wipe` flag!**

Usage
-----

```bash
lando db-import somedumpfile.sql.gz
```

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

{% codesnippet "./../examples/sql-import/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/sql-import).
