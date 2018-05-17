Redis
=====

[Redis](https://redis.io/) is an open source, in-memory and typed data structure store, used as a database, cache and message broker. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[4.0](https://hub.docker.com/r/_/redis/)** **(default)**
*   [3.2](https://hub.docker.com/r/_/redis/)
*   [3.0](https://hub.docker.com/r/_/redis/)
*   [2.8](https://hub.docker.com/r/_/redis/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/redis/tags/) are all the tags that are available for this service.

Here is an example of overriding the `nginx` service to use a patched version.

{% codesnippet "./../examples/patchversion/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/patchversion).

Example
-------

{% codesnippet "./../examples/redis/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/redis).

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
