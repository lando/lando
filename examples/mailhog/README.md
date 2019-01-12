MailHog Example
===============


[MailHog](https://github.com/mailhog/MailHog) is an email testing tool for developers. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Prefer video tutorials?
{% youtube %}
https://youtu.be/C1XfgfzcUJc
{% endyoutube %}

Supported versions
------------------

*   **[v1.0.0](https://hub.docker.com/r/mailhog/mailhog/)** **(default)**
*   custom

Using patch versions
--------------------

Because we use a third-party `mailhog` image specifying a patch version is not currently supported. If you need to use a patch version you might be able to use our [advanced service config](https://docs.devwithlando.io/config/advanced.html).

Example
-------


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mailhog).

Getting information
-------------------

You can get connection and credential information about your mailhog by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "appserver": {
    "type": "php",
    "version": "7.1",
    "via": "nginx",
    "webroot": "."
  },
  "nginx": {
    "urls": [
      "https://localhost:33745",
      "http://localhost:33746",
      "http://mailhog.lndo.site",
      "https://mailhog.lndo.site"
    ]
  },
  "database": {
    "type": "mysql",
    "version": "latest",
    "creds": {
      "user": "lemp",
      "password": "lemp",
      "database": "lemp"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": true
    }
  },
  "mailhog": {
    "type": "mailhog",
    "version": "latest",
    "internal_connection": {
      "host": "mailhog",
      "port": 1025
    },
    "external_connection": {
      "host": "localhost",
      "port": 1026
    },
    "urls": [
      "http://localhost:33742",
      "http://admin.mailhog.lndo.site"
    ]
  }
}
```


This example provides a very basic `mailhog` example built on th Lando LEMP recipe.

See the `.lando.yml` in this directory for `mailhog` configuration options.

Boot it
-------

Run the following commands to get up and running with this example.

```bash
# Start up the mailhog
lando start
```

Validation Commands
-------------------

Run the following commands to confirm things

```bash
# Verify mailhog portforward
docker inspect mailhog_mailhog_1 | grep HostPort | grep 1026
lando info | grep 1026

# Verify the mhsendmail binary was installed
lando ssh appserver -c "ls -lsa /usr/local/bin | grep mhsendmail"

# Verify we can send and recieve mail
lando alert
lando ssh -c "curl mailhog/api/v2/messages | grep leiaorgana@rebellion.mil"
```

Destruction
-----------

Run the following commands to clean up

```bash
# Destroy the mailhog
lando destroy -y
```
