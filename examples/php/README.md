PHP Example
===========

This example exists primarily to test the following documentation:

* [PHP Service](https://docs.devwithlando.io/tutorials/php.html)
* [Installing Node in a PHP Service](https://docs.lando.dev/guides/guides/installing-node-in-your-lando-php-service.html)
* [Issue #1990](https://github.com/lando/lando/issues/1990)
* [Issue #2192](https://github.com/lando/lando/issues/2192)

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
# Should use 7.4 as the default php version
lando ssh -s defaults -c "php -v" | grep "PHP 7.4"

# Should use 10.x as the default postgresql-client version
lando ssh -s defaults -c "psql -V | grep 10."

# Should use apache 2.4 as the default webserver version
lando ssh -s defaults -c "apachectl -V | grep 2.4."

# Should only serve over http by default
lando ssh -s defaults -c "curl https://localhost" || echo $? | grep 1

# Should serve from the app root by default
lando ssh -s defaults -c "curl http://localhost | grep ROOTDIR"

# Should have a 1G php mem limit on appserver
lando ssh -s defaults -c "curl http://localhost | grep memory_limit | grep 1G"

# Should have COMPOSER_MEMORY_LIMIT set to -1
lando ssh -s defaults -c "env" | grep "COMPOSER_MEMORY_LIMIT=-1"

# Should install composer 2.x by default
lando ssh -s defaults -c "composer --version --no-ansi" | grep "Composer version 2."

# Should have unlimited memory for php for CLI opts
lando php -i | grep memory_limit | grep -e "-1"
lando ssh -s defaults -c "php -i | grep memory_limit | grep -e \"-1\""

# Should have a PATH_INFO and PATH_TRANSLATED SERVER vars
lando ssh -s custom_nginx -c "curl https://localhost" | grep SERVER | grep PATH_INFO
lando ssh -s custom_nginx -c "curl https://localhost" | grep SERVER | grep PATH_TRANSLATED

# Should not enable xdebug by default
lando ssh -s defaults -c "php -m | grep xdebug" || echo $? | grep 1

# Should use specified php version if given
lando ssh -s custom -c "php -v" | grep "PHP 7.1"

# Should install composer 1.x if composer_version is set to true
lando ssh -s custom -c "composer --version --no-ansi" | grep "Composer version 1."

# Should serve via nginx if specified
lando ssh -s custom_nginx -c "curl http://localhost | grep WEBDIR"

# Should serve via https if specified
lando ssh -s custom_nginx -c "curl https://localhost | grep WEBDIR"

# Should enable xdebug if specified
lando ssh -s custom -c "php -m | grep xdebug"

# Should not serve port 80 for cli
lando ssh -s cli -c "curl http://localhost" || echo $? | grep 1

# Should install the latest composer 1.x using the 1 flag
lando ssh -s cli -c "composer --version --no-ansi" | grep "Composer version 1."

# Should use custom php ini if specified
lando ssh -s custom -c "php -i | grep memory_limit | grep 514"
lando ssh -s custom -c "curl http://custom_nginx" | grep html_errors | grep On | grep On

# Should inherit overrides from its generator
lando ssh -s custom -c "env | grep DUALBLADE | grep maxim"
lando ssh -s custom_nginx -c "env | grep DUALBLADE | grep maxim"

# Should use specified php version if given
lando ssh -s cliold -c "php -v" | grep "PHP 5.6"

# Should enable xdebug 2 for php 5.6
lando ssh -s cliold -c "php --re xdebug | head -1" | grep "xdebug version 2."

# Should use specified php version if given
lando ssh -s composer -c "php -v" | grep "PHP 7.0"

# Should use specified php version if given
lando ssh -s custom80 -c "php -v" | grep "PHP 8.0"

# Should have rsync in php 8.0
lando ssh -s custom80 -c "rsync --version"

# Should enable xdebug 3 for php 8.0
lando ssh -s custom80 -c "php --re xdebug | head -1" | grep "xdebug version 3."

# Should set the xdebug mode if specified
lando ssh -s custom80 -c "php -i" | grep xdebug.mode | grep develop,debug

# Should install the specified composer version
lando ssh -s composer -c "composer --version --no-ansi" | grep "Composer version 2.0.2"

# Should install compose global dependencies if specified by user and have them available in PATH
lando ssh -s composer -c "phpunit --version"
lando ssh -s composer -c "which phpunit | grep /var/www/.composer/vendor/bin/phpunit"

# Should PATH prefer composer dependency binaries installed in /app/vendor over global ones
lando ssh -s composer -c "composer require phpunit/phpunit"
lando ssh -s composer -c "phpunit --version"
lando ssh -s composer -c "which phpunit | grep /app/vendor/bin/phpunit"
lando ssh -s composer -c "composer remove phpunit/phpunit"
lando ssh -s composer -c "which phpunit | grep /var/www/.composer/vendor/bin/phpunit"

# Should have webp installed in php 7
lando ssh -s defaults -c "php -i" | grep WebP | grep enabled
lando ssh -s custom  -c "php -i" | grep WebP | grep enabled
lando ssh -s cli -c "php -i" | grep WebP | grep enabled
lando ssh -s composer -c "php -i" | grep WebP | grep enabled

# Should have webp installed in php 8
lando ssh -s custom80 -c "php -i" | grep WebP | grep enabled

# Should have node12 installed in withnode service
lando node -v -h withnode | grep v12.

# Should have node14 installed in cli service
lando node -v | grep v14.

# Should be able to run build steps on lando managed nginx service
# https://github.com/lando/lando/issues/1990
lando ssh -s custom_nginx -c "cat /app/test/managed_build_step"

# Should be able to override lando managed nginx service
# https://github.com/lando/lando/issues/1990
lando ssh -s custom_nginx -c "env | grep OTHER | grep stuff"
lando ssh -s custom_nginx -c "env | grep MORE | grep things"

# Should set PATH_INFO and PATH_TRANSLATED if appropriate
# https://github.com/lando/lando/issues/2192
lando ssh -s custom_nginx -c "curl http://localhost/path_info.php/a/b.php" | grep PATH_INFO | grep "/a/b.php"
lando ssh -s custom_nginx -c "curl http://localhost/path_info.php/a/b.php" | grep PATH_TRANSLATED | grep "/app/web/a/b.php"
lando ssh -s custom_nginx -c "curl http://localhost/path_info.php/a/b.php" | grep SCRIPT_NAME | grep "/path_info.php"
lando ssh -s defaults -c "curl http://localhost/path_info.php/a/b.php" | grep PATH_INFO | grep "/a/b.php"
lando ssh -s defaults -c "curl http://localhost/path_info.php/a/b.php" | grep PATH_TRANSLATED | grep "/app/a/b.php"
lando ssh -s defaults -c "curl http://localhost/path_info.php/a/b.php" | grep SCRIPT_NAME | grep "/path_info.php"

# Should allow cli services to specify a boot up command
lando info -s cliworker --deep | grep Cmd | grep sleep | grep infinity

# Should install the latest composer 2.x using the 2-latest flag
lando ssh -s cliworker -c "composer --version --no-ansi" | grep "Composer version 2."

```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
