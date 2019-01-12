Memcached Example
=================


[Memcached](https://memcached.org/) is an in-memory key-value store for small chunks of arbitrary data (strings, objects) from results of database calls, API calls, or page rendering. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[1.5](https://hub.docker.com/r/_/memcached/)** **(default)**
*   [1.4](https://hub.docker.com/r/_/memcached/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/memcached/tags/) are all the tags that are available for this service.

Example
-------


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

This example provides Memcached via a NodeJS example.

See the `.lando.yml` in this directory for Memcached configuration options.

Start me up
-----------

Run the following commands to get up and running with this example.

```bash
# Start up the memcache
lando start
```

Validate things are good
------------------------

Run the following commands to confirm things

```bash
# Verify the app booted up correctly and is showing memcache data
lando ssh appserver -c "curl localhost | grep server | grep cache:11211"

# Verify memcache portforward
docker inspect memcached_cache_1 | grep HostPort | grep 11222
lando info | grep port | grep 11222

# Verify memcache version
lando ssh cache -c "memcached -V | grep 1.4."

# Verify our custom memory setting was passed in
lando ssh appserver -c "curl localhost | grep limit_maxbytes | grep 268435456"
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```
# Get DB connection info
lando info
```

Destroy things
--------------

Run the following commands to clean up

```bash
# Destroy the memcache
lando destroy -y
```
