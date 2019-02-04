Dotnet Example
==============

This example exists primarily to test the following documentation:

* [Dotnet Service](https://docs.devwithlando.io/tutorials/dotnet.html)

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
# Should return 2.x for the default version
lando ssh -s defaults -c "dotnet --version | grep \'^2.\'"

# Should run on port 80 by default
lando ssh -s defaults -c "curl http://localhost" | grep "Hello there"

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
