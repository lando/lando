MySQL
=====

[MariaDB](https://www.mysql.com/) is a very common database server. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

### Supported versions

  * 8
  * 5.7
  * 5.6
  * 5.5
  * latest
  * custom

### Example

{% codesnippet "./../examples/mysql/.lando.yml" %}{% endcodesnippet %}

You will need to restart your app with `lando restart` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/mysql)

### Getting information

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
    ],
    "share": {
      "local": "www",
      "remote": "/usr/share/nginx/html"
    }
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
