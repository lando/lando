Redis Example
=============

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
