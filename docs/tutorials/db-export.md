Exporting Databases
===================

Lando ships with a helper `db-export` script that is available in all our `LAMP` and `LEMP` based recipes. Used in the recipe context it should export a database dump `DATABASE.TIMESTAMP.gz` into the `/app` directory.

> #### Warning::Postgres export not yet supported
>
> Lando will only handle `mysql` or `mariadb` exports at this time.

Usage
-----

At the command line execute:

```bash
lando db-export
```

### Examples

```bash
# Export to a file named `DATABASE.TIMESTAMP.gz`
lando db-export

# Export to a file called dump.sql.gz
lando db-export dump.sql.gz

# Export a secondary database
lando db-export --host db2 --database dataz

# Dump the result to stdout
lando db-export --stdout
```

### Options

```bash
Options:
  --host, -h      The database host
  --user, -u      The database user                            [default: "root"]
  --database, -d  The database name
  --password, -p  The database password
  --port, -P      The database port                              [default: 3306]
  --stdout        Dump database to stdout
```

Adding the `db-export` command
------------------------------

If you are not using one of our `php`-y recipes you can add the `db-export` command and default options to your `.lando.yml` as follows.

{% codesnippet "./../examples/mysql-export/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mysql-export).
