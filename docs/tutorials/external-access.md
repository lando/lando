Accessing Your Services Externally
==================================

It is often desireable to interact with your services on the host machine level. A common example of this is accessing a SQL database through a GUI client like SequelPro.

Lando makes this process relatively painless.

Checking Connection Info
------------------------

If you've spun up a Lando app using one of our [recipes](./../config/recipes.md) then its likely relevant services are already exposed and ready for access.

```bash
# Navigate to the app
cd /path/to/my/app

# Get info about it
lando info

{
  "appserver": {
    "type": "php",
    "version": "7.0",
    "via": "apache",
    "webroot": "www",
    "urls": [
      "https://localhost:32785",
      "http://localhost:32786",
      "http://backdrop.lndo.site",
      "https://backdrop.lndo.site"
    ],
    "share": {
      "remote": "/var/www/html"
    }
  },
  "database": {
    "type": "mariadb",
    "version": "latest",
    "creds": {
      "user": "backdrop",
      "password": "backdrop",
      "database": "backdrop"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": "32787"
    }
  }
}
```

In the example above you can access the `mariadb` database from your host at `localhost:32787`. Note that this port is automatically assigned by Docker itself and will change every time you restart your app.

That said, Lando provides a way to "lock down" these ports so they are more predictable.

Locking Down Ports
------------------

Say you've spun up an app using our Backdrop recipe but you are frustrated by the external database port always changing. You can modify your `.lando.yml` with some recipe overrides to assign a static port.

> #### Warning::THE PORT YOU FORWARD MUST BE AVAILABLE ON YOUR HOST!
>
> You are going to need to select a port that is actually available on your host machine. If you don't, then this will fail. It's a good idea to avoid common ports like `3306` which likely are in use already. To that end it's good practice to use a port CLOSE TO the default eg `3307` for `3306` or `5433` for `5432`.

```yml
name: myapp
recipe: backdrop
services:
  database:
    portforward: 3307
```

```bash
# Restart the app
lando restart

# Check to see the locked down port
lando info

{
  "appserver": {
    "type": "php",
    "version": "7.0",
    "via": "apache",
    "webroot": "www",
    "urls": [
      "https://localhost:32785",
      "http://localhost:32786",
      "http://backdrop.lndo.site",
      "https://backdrop.lndo.site"
    ],
    "share": {
      "remote": "/var/www/html"
    }
  },
  "database": {
    "type": "mariadb",
    "version": "latest",
    "creds": {
      "user": "backdrop",
      "password": "backdrop",
      "database": "backdrop"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": "3307"
    }
  }
}
```
