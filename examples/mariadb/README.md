MariaDB Example
===============

This example exists primarily to test the following documentation:

* [MariaDB Service](https://docs.devwithlando.io/tutorials/mariadb.html)

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
# Should use 10.3.27 as the default version
lando ssh -s defaults -c "mysql -V | grep 10.3.27"

# Should use the specfied version when set by the user
lando ssh -s custom -c "mysql -V | grep 10.3"

# Should use the patch version when set by the user
lando ssh -s patch -c "mysql -V | grep 10.2.21"

# Should use the correct default user pass db
lando ssh -s defaults -c "mysql -umariadb -pmariadb database -e quit"

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
