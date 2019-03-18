Django Example
==============

This example exists primarily to test the following issue(s):

* [Python executables are installed in wrong path subdirectory](https://github.com/lando/lando/issues/1519)

Maybe eventually this will be a full fledged Django example

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
# Should be able to run django-admin without errors
lando django-admin --version | grep "^2."
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
