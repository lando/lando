SQL Import Example
==================

This example exists primarily to test the following documentation:

* [Import SQL Database](https://docs.devwithlando.io/guides/db-import.html)

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
# Should be able to connect to the relevant databases
lando mysql database -e quit
lando psqlverify

# Should be able to import into database by default
lando db-import test.sql
lando mysql database -e "show tables;" | grep users

# Should be able to import into user specified database
lando db-import -h database2 test2.sql
lando psqlverify | grep users

# Should be able to use db-import events
lando ssh -s database -c "cat /tmp/iran.txt"

# Should persist data after a rebuild
lando rebuild -y
lando mysql database -e "show tables;" | grep users
lando psqlverify | grep users

# Should be able to handle absolute paths if given
lando db-import /data/test.sql

# Should be able to dump tables with foreign key constraints
lando db-import big-bad-dump.sql
lando db-import big-bad-dump.sql
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
