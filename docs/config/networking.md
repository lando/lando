Networking
==========

Lando services should be able to communicate with services within their own app but also services from other apps. You can access a service within your app using the service name eg `nginx` or `database`. Or a service in another app using the `<service>.<app>.internal` convention eg `redis.myapp.internal`.

> #### Warning::Cross app service communication requires all apps be on
>
> If you want a service in App A to talk to a service in App B then you need to make sure you've started up both apps!

You can also use `lando info` to get more information about the hostnames that your service is accesible on.

```bash
lando info

{
  "appserver": {
    "type": "php",
    "version": "7.1",
    "via": "nginx",
    "webroot": ".",
    "config": {
      "server": "config/nginx.conf",
      "conf": "config/php.ini"
    },
    "hostnames": [
      "appserver",
      "appserver.lemp2.internal"
    ]
  },
  "nginx": {
    "type": "php",
    "version": "7.1",
    "via": "nginx",
    "webroot": ".",
    "config": {
      "server": "config/nginx.conf",
      "conf": "config/php.ini"
    },
    "hostnames": [
      "nginx",
      "nginx.lemp2.internal"
    ],
    "urls": [
      "https://localhost:32794",
      "http://localhost:32795",
      "http://lemp2.lndo.site",
      "https://lemp2.lndo.site"
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
      "port": "32793"
    },
    "hostnames": [
      "database",
      "database.lemp2.internal"
    ]
  }
}
```
