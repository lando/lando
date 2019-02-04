MSSQL Example
=============

This example exists primarily to test the following documentation:

* [MSSQL Service](https://docs.devwithlando.io/tutorials/mssql.html)

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
# Should be able to connect
lando ssh -s defaults -c "sqlcmd -U sa -H database -P he11oTHERE -Q quit"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
