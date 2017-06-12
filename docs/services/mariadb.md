MariaDB
=======

[MariaDB](https://mariadb.org/) is a very common database server which is *EXTREMELY* similar to mysql and has a guarantee of being open source. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   10.3
*   10.2
*   10.1
*   10.0
*   5.5
*   latest
*   custom

Example
-------

{% codesnippet "./../examples/mariadb/.lando.yml" %}{% endcodesnippet %}

You will need to restart your app with `lando restart` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/mariadb)

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
      "https://localhost:32802",
      "http://localhost:32803",
      "http://mariadb.lndo.site",
      "https://mariadb.lndo.site"
    ],
    "share": {
      "local": "www",
      "remote": "/usr/share/nginx/html"
    }
  },
  "database": {
    "type": "mariadb",
    "version": "10.1",
    "creds": {
      "user": "mariadb",
      "password": "mariadb",
      "database": "mariadb"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": 3307
    }
  }
}
```
