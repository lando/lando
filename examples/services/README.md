Services Example
================

This example exists primarily to test the following documentation:

* [Build Steps](http://docs.devwithlando.io/config/services.html#build-steps)
* [Overrides](http://docs.devwithlando.io/config/services.html#overrides)
* [Using Dockerfiles](http://docs.devwithlando.io/config/services.html#using-dockerfiles)

See the [Landofiles](http://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Should start successfully and verify build steps run at more or less the right times
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should have mounted overridden nginx volume
lando ssh -s nginx -c "cat /var/www/test.txt | grep MOUNTED"

# Should have injected overriden envvar into nginx
lando ssh -s nginx -c "env | grep THING=STUFF"

# Should have built appserver from a custom docker image
lando ssh -s appserver -c "env | grep CUSTOM=PIROG"

# Should be able to rebuild without pulling local image
lando rebuild -y
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff

# Should remove custom image
docker rmi --force pirog/php:7.1-fpm-custom
```
