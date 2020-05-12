PHP Extensions Example
======================

This example exists primarily to test the following guide:

* [Installing PHP Extensions on Lando](https://docs.lando.devguides/installing-php-extensions-on-lando.html)

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
# Should have installed the needed php extensions
lando ssh -s buildsteps -c "php -m" | grep stats
lando ssh -s buildsteps -c "php -m" | grep xsl
lando ssh -s dockerfile -c "php -m" | grep oci8
lando ssh -s dockerfile -c "php -m" | grep pdo_sqlsrv
lando ssh -s dockerfile -c "php -m" | grep sqlsrv
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
