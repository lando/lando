Varnish Example
===============

This example exists primarily to test the following documentation:

* [Varnish Service](https://docs.devwithlando.io/tutorials/varnish.html)

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
# Should use varnish 4 by default
lando ssh -s defaults -c "curl -I localhost | grep Via | grep varnish-v4"

# Should backend from appserver by default
lando ssh -s defaults -c "curl localhost | grep sophisticated"

# Should also serve over https if specified
lando ssh -s custom_ssl -c "curl -k https://localhost | grep sophisticated"

# Shoule use a custom vcl file if specified
lando ssh -s custom -c "cat /etc/varnish/conf.d/lando.vcl | grep LANDOVARNISH"

# Should use a custom backend port when specified
lando ssh -s customport -c "curl http://localhost | grep SAW"

# Should use a custom backend port with SSL if specified
lando ssh -s customport_ssl -c "curl -k https://localhost | grep SAW"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
