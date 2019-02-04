Ruby Example
============

This example exists primarily to test the following documentation:

* [Ruby Service](https://docs.devwithlando.io/tutorials/ruby.html)

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
# Should use 2.5.x as the default version
lando ssh -s defaults -c "ruby --version | grep 2.5."

# Should use the user specified version when set
lando ssh -s custom -c "ruby --version | grep 2.6."

# Should use the user specified patch version when set
lando ssh -s patch -c "ruby --version | grep 2.5.3"

# Should run on the custom port when specified
lando ssh -s custom -c "curl http://localhost:8080 | grep OHNO"

# Should run on port 80 by default
lando ssh -s defaults -c "curl http://localhost | grep TROUBLE"

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
