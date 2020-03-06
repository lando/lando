Scanner Example
===============

This example exists primarily to test the following documentation:

* [Service Scanning](http://docs.devwithlando.io/config/services.html#build-steps)

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
# Should set 80,443 in io.lando.http-ports label by default
docker inspect landoscanner_scanme_1 | grep io.lando.http-ports | grep "80,443"

# Should add an extra port to io.lando.http-ports if specified
docker inspect landoscanner_moreports_1 | grep io.lando.http-ports | grep "80,443,8888"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
