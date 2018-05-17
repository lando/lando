MSSQL
=====

[MSSQL](https://www.microsoft.com/en-us/sql-server/sql-server-2016) lets you build intelligent, mission-critical applications using a scalable, hybrid database platform that has everything built in—from in-memory performance and advanced security to in-database analytics. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [latest](https://hub.docker.com/r/microsoft/mssql-server-linux/)
*   custom

> #### Warning::YOU MUST BOOST YOUR RAM TO USE THIS SERVICE
>
> MSSQL currently requires 4GB of RAM to run, which is above the 2GB default set by Docker. To boost your ram please check out: https://github.com/Microsoft/mssql-docker/issues/114

Using patch versions
--------------------

Because we use our own custom image for `php` specifying a patch version is not currently supported. If you need to use a patch version you might be able to use our [advanced service config](https://docs.devwithlando.io/config/advanced.html).

Example
-------

{% codesnippet "./../examples/mssql/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mssql).

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
    "webroot": "www",
    "urls": [
      "http://localhost:32774",
      "http://mssql.lndo.site",
      "https://mssql.lndo.site"
    ]
  },
  "database": {
    "type": "mssql",
    "version": "latest",
    "creds": {
      "user": "sa",
      "password": "he11oTHERE"
    },
    "internal_connection": {
      "host": "database",
      "port": 1443
    },
    "external_connection": {
      "host": "localhost",
      "port": "1434"
    }
  }
}
```
