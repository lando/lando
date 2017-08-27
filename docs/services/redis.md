Redis
=====

[Redis](https://redis.io/) is an open source, in-memory and typed data structure store, used as a database, cache and message broker. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [4.0](https://hub.docker.com/r/_/redis/)
*   [3.2](https://hub.docker.com/r/_/redis/)
*   [3.0](https://hub.docker.com/r/_/redis/)
*   [2.8](https://hub.docker.com/r/_/redis/)
*   [latest](https://hub.docker.com/r/_/redis/)
*   custom

Example
-------

{% codesnippet "./../examples/redis/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/redis).

Getting information
-------------------

You can get connection and credential information about your redis instance by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "cache": {
    "type": "redis",
    "version": "3.2",
    "internal_connection": {
      "host": "cache",
      "port": 6379
    },
    "external_connection": {
      "host": "localhost",
      "port": 6380
    }
  },
  "appserver": {
    "type": "node",
    "version": "6.10",
    "urls": [
      "http://localhost:32802",
      "http://redis.lndo.site"
    ]
  }
}
```
