LEMP Example
============

This example exists primarily to test the following documentation:

* [LEMP Recipe](https://docs.devwithlando.io/tutorials/lemp.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest cakephp codebase
rm -rf lemp && mkdir -p lemp && cd lemp
lando init --source remote --remote-url git://github.com/cakephp/cakephp.git --remote-options="--branch 2.x --depth 1" --recipe lemp --webroot . --name lando-lemp

# Should start up successfully
cd lemp
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the drupal installation page by default
cd lemp
lando ssh -s appserver_nginx -c "curl -L localhost" | grep "CakePHP"

# Should use 7.2 as the default php version
cd lemp
lando php -v | grep 7.2

# Should be running nginx 1.x by default
cd lemp
lando ssh -s appserver_nginx -c "nginx -v 2>&1 | grep 1."
lando ssh -s appserver_nginx -c "curl -IL localhost" | grep Server | grep nginx | grep "1."

# Should be running mysql 5.7 by default
cd lemp
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd lemp
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd lemp
lando mysql -ulemp -plemp lemp -e quit

# Should be able to global require a composer dep
cd lemp
lando composer global require phpunit/phpunit
lando ssh -s appserver -c "phpunit --version"
lando ssh -s appserver -c "which phpunit | grep /var/www/"

# Should be able to require a composer dep
cd lemp
lando composer require phpunit/phpunit
lando ssh -s appserver -c "/app/vendors/bin/phpunit --version"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd lemp
lando destroy -y
lando poweroff
```
