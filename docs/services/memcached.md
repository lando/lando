Memcached
=========

[Memcached](https://memcached.org/) is an in-memory key-value store for small chunks of arbitrary data (strings, objects) from results of database calls, API calls, or page rendering. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[1.5](https://hub.docker.com/r/_/memcached/)** **(default)**
*   [1.4](https://hub.docker.com/r/_/memcached/)
*   custom

Example
-------

{% codesnippet "./../examples/memcached/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/memcached).

Getting information
-------------------

You can get connection and credential information about your memcached instance by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "cache": {
    "type": "memcached",
    "version": "1.4",
    "internal_connection": {
      "host": "cache",
      "port": 11211
    },
    "external_connection": {
      "host": "localhost",
      "port": 11222
    }
  },
  "appserver": {
    "type": "node",
    "version": "6.10",
    "urls": [
      "http://localhost:32796",
      "http://memcache.lndo.site"
    ]
  }
}
```
