Importing Databases
===================

Lando ships with a helper `db-import` script that is available in all our `LAMP` and `LEMP` based recipes. Used in the recipe context it should import a database dump into the recipe-provided database by default.

You can also import databases into other hosts. It will currently handle uncompressed, gzipped or zipped dump files.

> #### Warning::Postgres import not yet supported
>
> Lando will only handle `mysql` or `mariadb` compatible files at this time.

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
lando db-import dump.zip --host db2 --database dataz
```

### Options

```bash
Options:
  --host, -h      The database host
  --user, -u      The database user                            [default: "root"]
  --database, -d  The database name
  --password, -p  The database password
  --port, -P      The database port                              [default: 3306]
```

Adding the `db-import` command
------------------------------

If you are not using one of our `php`-y recipes you can add the `db-import` command and default options to your `.lando.yml` as follows.

{% codesnippet "./../examples/mysql-import/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mysql-import).
