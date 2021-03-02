---
description: Learn how to access your Lando services externally from your host machine.
date: 2019-11-05
---

# Accessing Your Services Externally

<GuideHeader />

It is often desirable to interact with your services on the host machine level. Common examples of this are accessing a SQL database through a GUI client like SequelPro, or running unit tests through an IDE like PhpStorm.

Lando makes this process relatively painless.

## Checking Connection Info

If you've spun up a Lando app using one of our [recipes](./../config/recipes.md) then its likely relevant services are already exposed and ready for access.

```bash
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
    ]
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

## Locking Down Ports

Say you've spun up an app using our Backdrop recipe but you are frustrated by the external database port always changing. You can modify your `.lando.yml` with some recipe overrides to assign a static port.

::: warning THE PORT YOU FORWARD MUST BE AVAILABLE ON YOUR HOST!
You are going to need to select a port that is actually available on your host machine. If you don't, then this will fail. It's a good idea to avoid common ports like `3306` which likely are in use already. To that end it's good practice to use a port CLOSE TO the default eg `3307` for `3306` or `5433` for `5432`.
:::

```yml
name: myapp
recipe: backdrop
services:
  database:
    portforward: 3307
```

```bash
# rebuild from app directory
lando rebuild --yes

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
    ]
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

## Mapping to The Lando Network

Some IDEs, such as PhpStorm, will spin up a separate container to run their appserver for services like built-in unit testing.  This means that it is separate from the Lando network and cannot communicate with Lando's other containers, such as the database.  In order to allow them to communicate, you need to tell your interpreter which network to listen on.

::: warning If you got this message...
`php_network_getaddresses: getaddrinfo failed: Name or service not known` while PHPUnit testing in PHPStorm and use a MySQL test database, you're in the right place!
:::

First, find your Lando network name by going to the terminal, and _outside of Lando_ run `$ docker network ls`.  You should find a record matching your Lando project.  For example, if your Lando project is named `d7dev`, then you should see something like:

```
    NETWORK ID          NAME                                        DRIVER              SCOPE
    d9526b32d92c        d7dev_default                               bridge              local

```

Next, ensure your framework (PHP) interpreter is configured to use a Docker container matching your project's appserver configuration.  For example, if your running PHP 7.1 on Apache, this would look like `devwithlando/php:7.1-apache`.

Finally, when configuring your framework, edit the Docker Container settings and change the Network Mode to the name of your Lando docker network.

Now your IDE should be able to communicate with Lando.

<GuideFooter />
<Newsletter />
