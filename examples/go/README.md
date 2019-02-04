Go Example
==========

This example exists primarily to test the following documentation:

* [Go Service](https://docs.devwithlando.io/tutorials/go.html)

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
# Should use 1.11 as the default version
lando ssh -s defaults -c "go version | grep go1.11"

# Should run only on port 80 by default
lando ssh -s defaults -c "curl http://localhost" | grep HEART
lando ssh -s defaults -c "curl -k https://localhost" || echo $? | grep 1

# Should use the version if specified by user
lando ssh -s patch -c "go version | grep go1.10.7"

# Should serve over http and https if ssl is set by user
lando ssh -s custom -c "curl http://localhost" | grep HEART
lando ssh -s custom -c "curl -k https://localhost" | grep HEART

# Should not serve port 80 for cli
lando ssh -s cli -c "curl http://localhost" || echo $? | grep 1
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
