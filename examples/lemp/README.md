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

# Should move in our custom config and landofile
cp -f .lando.local.yml lemp/.lando.local.yml
cp -rf config lemp/config

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

# Should use 7.3 as the default php version
cd lemp
lando php -v | grep "PHP 7.3"

# Should be running nginx 1.17 by default
cd lemp
lando ssh -s appserver_nginx -c "nginx -v 2>&1 | grep 1.17"

# Should be running mysql 5.7 by default
cd lemp
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd lemp
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd lemp
lando mysql -ulemp -plemp lemp -e quit

# Should use custom vhosts config
cd lemp
lando ssh -s appserver_nginx -c "cat /opt/bitnami/nginx/conf/vhosts/lando.conf" | grep "CUSTOMVHOSTSCONFIG"

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
