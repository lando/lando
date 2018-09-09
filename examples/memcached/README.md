Memcached Example
=================

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

Destroy things
--------------

Run the following commands to clean up

```bash
# Destroy the memcache
lando destroy -y
```
