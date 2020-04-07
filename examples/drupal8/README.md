Drupal 8 Example
================

This example exists primarily to test the following documentation:

* [Drupal 8 Recipe](https://docs.devwithlando.io/tutorials/drupal8.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest Drupal 8 codebase
rm -rf drupal8 && mkdir -p drupal8 && cd drupal8
lando init --source remote --remote-url https://www.drupal.org/download-latest/tar.gz --remote-options="--strip-components 1" --recipe drupal8 --webroot . --name lando-drupal8 --option database=mysql:8.0 --option drush=10.2.1

# Should copy in the .lando.local.yml
cp -f .lando.local.yml drupal8/.lando.local.yml

# Should start up successfully
cd drupal8
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the drupal installation page by default
cd drupal8
lando ssh -s appserver -c "curl -L localhost" | grep "Drupal 8"

# Should use 7.2 as the default php version
cd drupal8
lando php -v | grep "PHP 7.2"

# Should be running apache 2.4 by default
cd drupal8
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 8.0
cd drupal8
lando mysql -V | grep 8.0

# Should be using the mysql_native_password authentication plugin by default
lando mysql -u root -e "SELECT user,plugin FROM mysql.user;" | grep drupal | grep mysql_native_password

# Should not enable xdebug by default
cd drupal8
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd drupal8
lando mysql -udrupal8 -pdrupal8 drupal8 -e quit

# Should use drush 10.x
cd drupal8
lando drush version | grep 10.2.1

# Should be able to install drupal
cd drupal8
lando drush site:install --db-url=mysql://drupal8:drupal8@database/drupal8 -y

# Should install drupal console
# cd drupal8
# chmod -Rv 755 sites/default
# lando composer require drupal/console:~1.0 --prefer-dist --optimize-autoloader
true

# Should have drupal console
# cd drupal8
# lando drupal -V
true

# Should be able to handoff to sitelocal drush without issue
cd drupal8
chmod -Rv 755 sites/default
lando composer require drush/drush:10.2.2
lando drush version | grep 10.2.2
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd drupal8
lando destroy -y
lando poweroff
```
