MySQL Example
=============

This example exists primarily to test the following documentation:

* [MySQL Service](https://docs.devwithlando.io/tutorials/mysql.html)

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
# Should use 5.7.x as the default version
lando ssh -s defaults -c "mysql -V | grep 5.7"

# Should use the specfied version when set by the user
lando ssh -s custom -c "mysql -V | grep 8.0"

# Should use the patch version when set by the user
lando ssh -s patch -c "mysql -V | grep 5.7.24"

# Should use the correct default user pass db
lando ssh -s defaults -c "mysql -umysql -pmysql database -e quit"

# Should use the user provided creds if given
lando ssh -s custom -c "mysql -upirog -ppassword stuff -e quit"

# Should use a custom config file if specified
lando mysql -e "show variables;" | grep table_open_cache | grep 513
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
