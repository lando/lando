PhpMyAdmin Example
==================

This example exists primarily to test the following documentation:

* [PhpMyAdmin Service](https://docs.devwithlando.io/tutorials/phpmyadmin.html)

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
# Should return 200 for the pma admin site
lando ssh -s pma -c "curl -I localhost | grep 200 | grep OK"
lando ssh -s pma_theme -c "curl -I localhost | grep 200 | grep OK"

# Should have databases that work correctly
lando ssh -s database -c "mysql -umariadb -pmariadb database -e quit"
lando ssh -s database2 -c "mysql -umariadb -pmariadb database -e quit"

# Should have our databases hooked up to PMA
lando ssh -s pma -c "env | grep PMA_HOSTS=database,database2"
lando ssh -s pma_theme -c "env | grep PMA_HOSTS=database,database2"

# Should have set a custom config file if specified
lando ssh -s pma_theme -c "cat /etc/phpmyadmin/config.user.inc.php" | grep ThemeDefault | grep pmaterial
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
