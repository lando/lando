nginx Example
=============

This example exists primarily to test the following documentation:

* [nginx Service](https://docs.devwithlando.io/tutorials/nginx.html)

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
# Should use 1.14.x as the default version
lando ssh -s defaults -c "nginx -v 2>&1 | grep 1.14"

# Should use the user specified patch version if given
lando ssh -s patch -c "nginx -v 2>&1 | grep 1.14.1"

# Should serve from the app root by default
lando ssh -s defaults -c "curl http://localhost | grep ROOTDIR"

# Should only serve over http by default
lando ssh -s defaults -c "curl -k https://localhost" || echo $? | grep 1

# Should serve from webroot if specified
lando ssh -s custom -c "curl http://localhost | grep WWWDIR"

# Should serve from https when specified
lando ssh -s custom -c "curl -k https://localhost | grep WWWDIR"

# Should mount custom config to the correct locations
lando ssh -s custom -c "cat /opt/bitnami/extra/nginx/templates/nginx.conf.tpl | grep LANDOSERVER"
lando ssh -s custom -c "cat /opt/bitnami/extra/nginx/templates/default.conf.tpl | grep LANDOVHOSTS"
lando ssh -s custom -c "cat /opt/bitnami/nginx/conf/fastcgi_params | grep LANDOPARAMS"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
