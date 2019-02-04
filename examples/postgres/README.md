Postgres Example
================

This example exists primarily to test the following documentation:

* [Postgres Service](https://docs.devwithlando.io/tutorials/postgres.html)

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
# Should use 10.x as the default version
lando ssh -s defaults -c "psql -V | grep 10."

# Should use the specfied version when set by the user
lando ssh -s custom -c "psql -V | grep 11."

# Should use the patch version when set by the user
lando ssh -s patch -c "psql -V | grep 9.6.1"

# Should use the correct default user pass db
lando verifydefaults

# Should use the correct default user pass db
lando verifycustom

# Should use a custom config file if specified
lando showmax | grep 999

# Should be able to receive connections from the outside
lando crossconnect

# should show the correct user in info
lando info -s mimicarecipe | grep user | grep postgres

# should show the correct password in info
lando info -s mimicarecipe | grep -v empty
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
