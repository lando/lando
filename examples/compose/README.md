Compose Example
===============

This example exists primarily to test the following documentation:

* [Compose Service](https://docs.devwithlando.io/tutorials/compose.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should start up successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should have used the custom image
docker inspect landocompose_custom-service_1 | grep Image | grep drupal:8

# Should be using the lando entrypoint
docker inspect landocompose_custom-service_1 | grep Path | grep lando-entrypoint.sh

# Should be using the correct command
docker inspect landocompose_custom-service_1  | grep docker-php-entrypoint
docker inspect landocompose_custom-service_1  | grep apache2-foreground

# Should be the drupal8 installation page
lando ssh -s custom-service -c "curl -L localhost" | grep "Choose language"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
