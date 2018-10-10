Issue 1141
==========

This is a test to replicate and then fix [#1141](https://github.com/lando/lando/issues/1141)

Start me up!
------------

```bash
# Build the php-fpm 5.3 docker image
docker build -t landotest/php:5.3-fpm ./../../plugins/lando-services/services/php/5.3-fpm

# Start up an example using that image
lando start
```

Verify things are in order
--------------------------

Run these commands to make sure things are right as rain.

```bash
# Verify this app is using the built image from above
docker inspect freetypefpm53_appserver_1 | grep Image | grep landotest/php:5.3-fpm

# Verify that it is rolling with freetype installed
lando php -i | grep "with freetype"
```

Destroy the app
---------------

Run these commands to ensure we clean things up.

```bash
# Destroy our custom image
docker rmi -f landotest/php:5.3-fpm

# Destroys our custom app
lando destroy -y
```
