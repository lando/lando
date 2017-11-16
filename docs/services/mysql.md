MySQL
=====

[MySQL](https://www.mysql.com/) is a very common database server. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [8](https://hub.docker.com/r/_/mysql/)
*   [5.7](https://hub.docker.com/r/_/mysql/)
*   [5.6](https://hub.docker.com/r/_/mysql/)
*   [5.5](https://hub.docker.com/r/_/mysql/)
*   [latest](https://hub.docker.com/r/_/mysql/)
*   custom

> #### Warning::Be Careful Switching Database Type or Version
>
> You should be careful switching database types or versions as the underlying database files between these things may not be compatible. **Ignoring this warning can cause your database service to not start correctly!!!**
>
> You can read more about this [here](./../issues/switching-dbs.md)

Example
-------

{% codesnippet "./../examples/mysql/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mysql).

Getting information
-------------------

You can get connection and credential information about your database by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "appserver": {
    "type": "nginx",
    "version": "latest",
    "urls": [
      "https://localhost:32808",
      "http://localhost:32809",
      "http://mysql.lndo.site",
      "https://mysql.lndo.site"
    ]
  },
  "db": {
    "type": "mysql",
    "version": "latest",
    "creds": {
      "user": "mysql",
      "password": "password",
      "database": "database"
    },
    "internal_connection": {
      "host": "db",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": true
    }
  }
}
```
