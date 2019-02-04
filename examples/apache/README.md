Apache Example
==============

This example exists primarily to test the following documentation:

* [Apache Service](https://docs.devwithlando.io/tutorials/apache.html)

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
# Should return 2.4.x for the default version
lando ssh -s defaults -c "apachectl -V | grep 2.4."

# Should return 2.4.37 for the patch service
lando ssh -s patch -c "apachectl -V | grep 2.4.37"

# Should serve from the app root by default
lando ssh -s defaults -c "curl http://localhost | grep ROOTDIR"

# Should only serve over http by default
lando ssh -s defaults -c "curl -k https://localhost" || echo $? | grep 1

# Should serve from webroot if specified
lando ssh -s custom -c "curl http://localhost | grep WEBDIR"

# Should serve from https when specified
lando ssh -s custom -c "curl -k https://localhost | grep WEBDIR"

# Should mount custom config to the correct locations
lando ssh -s custom -c "cat /bitnami/apache/conf/httpd.conf | grep LANDOHTTPD"
lando ssh -s custom -c "cat /bitnami/apache/conf/bitnami/bitnami.conf | grep LANDOCUSTOM"

# Should use htaccess-lando if it exists
lando ssh -s override -c "curl -I http://landoapache.lndo.site/folder1" | grep Location | grep http://landoapache.lndo.site/folder2/
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
