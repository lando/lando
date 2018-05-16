Exporting Databases
===================

Lando ships with a helper `db-export` script that is available in all our `LAMP` and `LEMP` based recipes. Used in the recipe context it should export a database dump `DATABASE.TIMESTAMP.gz` into the `/app` directory.

You can also export databases from other services.

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

# Export from a secondary database
lando db-export --host db2

# Dump the result to stdout
lando db-export --stdout
```

### Options

```bash
Options:
  --host, -h      The database service to use                  [default: "database"]
  --stdout        Dump database to stdout
```

Adding the `db-export` command
------------------------------

If you are not using one of our `php`-y recipes you can add the `db-export` command and default options to your `.lando.yml` as follows.

{% codesnippet "./../examples/sql-export/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/sql-export).
