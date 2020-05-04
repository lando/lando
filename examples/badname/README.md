Badname Example
===============

This example exists primarily to test the following:

* [Issue #1767](https://github.com/lando/lando/issues/1767)

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
# Should serve from the app root by default
lando ssh -s defaults -c "curl http://localhost | grep ROOTDIR"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
