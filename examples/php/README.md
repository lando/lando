PHP Example
===========

This example exists primarily to test the following documentation:

* [PHP Service](https://docs.devwithlando.io/tutorials/php.html)

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
# Should use 7.2 as the default php version
lando ssh -s defaults -c "php -v | grep 7.2"

# Should use apache 2.4 as the default webserver version
lando ssh -s defaults -c "apachectl -V | grep 2.4."

# Should only serve over http by default
lando ssh -s defaults -c "curl -k https://localhost" || echo $? | grep 1

# Should serve from the app root by default
lando ssh -s defaults -c "curl http://localhost | grep ROOTDIR"

# Should have a 1G php mem limit on appserver
lando ssh -s defaults -c "curl http://localhost | grep memory_limit | grep 1G"

# Should have unlimited memory for php for CLI opts
lando php -i | grep memory_limit | grep -e "-1"
lando ssh -s defaults -c "php -i | grep memory_limit | grep -e \"-1\""

# Should not enable xdebug by default
lando ssh -s defaults -c "php -m | grep xdebug" || echo $? | grep 1

# Should use specified php version if given
lando ssh -s custom -c "php -v | grep 7.1"

# Should serve via nginx if specified
lando ssh -s custom_nginx -c "curl http://localhost | grep WEBDIR"

# Should serve via https if specified
lando ssh -s custom_nginx -c "curl -k https://localhost | grep WEBDIR"

# Should enable xdebug if specified
lando ssh -s custom -c "php -m | grep xdebug"

# Should not serve port 80 for cli
lando ssh -s cli -c "curl http://localhost" || echo $? | grep 1

# Should use custom php ini if specified
lando ssh -s custom -c "php -i | grep memory_limit | grep 514"

# Should use specified php version if given
lando ssh -s cliold -c "php -v | grep 5.6"

# Should use specified php version if given
lando ssh -s composer -c "php -v | grep 7.0"

# Should install compose global dependencies if specified by user and have them available in PATH
lando ssh -s composer -c "phpunit --version"
lando ssh -s composer -c "which phpunit | grep /var/www/.composer/vendor/bin/phpunit"

# Should PATH prefer composer dependency binaries installed in /app/vendor over global ones
lando ssh -s composer -c "composer require phpunit/phpunit"
lando ssh -s composer -c "phpunit --version"
lando ssh -s composer -c "which phpunit | grep /app/vendor/bin/phpunit"
lando ssh -s composer -c "composer remove phpunit/phpunit"
lando ssh -s composer -c "which phpunit | grep /var/www/.composer/vendor/bin/phpunit"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
