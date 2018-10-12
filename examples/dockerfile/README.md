Dockerfile Example
==================

This example shows how you can extend our `php` Docker images to add in extra php extensions using a Dockerfile instead of the normal Lando [build steps](https://docs.devwithlando.io/config/build.html) or [overrides](https://docs.devwithlando.io/config/advanced.html).

This method can be used for any of the other images we use to power our other [services](https://docs.devwithlando.io/config/services.html).

See the `.lando.yml` in this directory for configuration options.

Boot it up
----------

Run the following steps to get up and running with this example.

```bash
# Spin up a lemp stack with a custom and locally built Dockerfile
lando start
```

Sanity checks
-------------

Run these commands to verify things spun up correctly

```bash
# Verify we are using the correct local custom image
docker inspect dockerfile_appserver_1 | grep Image | grep pirog/php:7.1-fpm-custom

# Verify the provided via-dockerfile-php extension is loaded
lando php -i | grep pcntl

# Verify custom volume mounts
lando php -i | grep memory_limit | grep 513M
```

Burn it to the ground
---------------------

Run these commands to verify things have been cleaned up

```bash
# Destroy the custom docker image
docker rmi -f pirog/php:7.1-fpm-custom

# Destroy the app
lando destroy -y
```
