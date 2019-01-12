Redis Example
=============

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

Example
-------


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
This example provides a NodeJS based redis cache example.

See the `.lando.yml` in this directory for redis configuration options.

Start me up
-----------

Run the following commands to get up and running with this example.

```bash
# Start up the redis
lando start
```

Validate things are good
------------------------

Run the following commands to confirm things

```bash
# Verify the app booted up correctly and is showing redis data
lando ssh appserver -c "curl localhost | grep run_id"

# Verify redis version
lando ssh appserver -c "curl localhost | grep redis_version | grep 3.2."

# Verify that redis was started in append only mode
docker inspect redis_cache_1 | grep appendonly

# Verify redis portforward
docker inspect redis_cache_1 | grep HostPort | grep 6380
lando info | grep port | grep 6380

# Verify we have the redis cli
lando redis-cli --version | grep 3.2.
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get cache connection info
lando info

# Confirm redis connection and drop into redis-cli
lando redis-cli
```

Destroy things
--------------

Run the following commands to clean up

```bash
# Destroy the redis
lando destroy -y
```
