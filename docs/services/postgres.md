PostgreSQL
==========

[PostgreSQL](https://www.postgresql.org/) is an advanced open source database server. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [10-beta3](https://hub.docker.com/r/_/postgres/)
*   [9.6](https://hub.docker.com/r/_/postgres/)
*   [9.5](https://hub.docker.com/r/_/postgres/)
*   [9.4](https://hub.docker.com/r/_/postgres/)
*   [9.3](https://hub.docker.com/r/_/postgres/)
*   [9.2](https://hub.docker.com/r/_/postgres/)
*   [latest](https://hub.docker.com/r/_/postgres/)
*   custom

> #### Warning::Be Careful Switching Database Type or Version
>
> You should be careful switching database types or versions as the underlying database files between these things may not be compatible. **Ignoring this warning can cause your database service to not start correctly!!!**
>
> You can read more about this [here](./../issues/switching-dbs.md)

Example
-------

{% codesnippet "./../examples/postgres/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/postgres).

Getting information
-------------------

You can get connection and credential information about your database by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "html": {
    "type": "nginx",
    "version": "latest",
    "urls": [
      "https://localhost:32811",
      "http://localhost:32812",
      "http://postgres.lndo.site",
      "https://postgres.lndo.site"
    ]
  },
  "tswift": {
    "type": "postgres",
    "version": "latest",
    "creds": {
      "user": "trouble",
      "password": "trouble",
      "database": "trouble"
    },
    "internal_connection": {
      "host": "tswift",
      "port": 5432
    },
    "external_connection": {
      "host": "localhost",
      "port": 5444
    }
  }
}
```
