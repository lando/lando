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

# Should allow relative paths in volume mounting
lando ssh -s custom-service2 -c "cat /tmp/monkeysee.txt" | grep CHAOS

# Should have built custom service 2 from local relative path
lando ssh -s custom-service2 -c "env | grep SPICE=GIRLS"

# Should have built custom database 2 from local relative path
lando ssh -s custom-database2 -c "env | grep BRITNEY=SPEARS"

# Should be able to add named volume data persistence
lando ssh -s custom-database -u root -c "echo things > /var/lib/postgresql/data/stuff"

# Should be able to rebuild without pulling local image and named volumes should work
lando rebuild -y
lando ssh -s custom-database -u root -c "cat /var/lib/postgresql/data/stuff | grep things"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
