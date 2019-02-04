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
lando init --source remote --remote-url https://www.drupal.org/download-latest/tar.gz --remote-options="--strip-components 1" --recipe drupal8 --webroot . --name lando-drupal8

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
lando php -v | grep 7.2

# Should be running apache 2.4 by default
cd drupal8
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 5.7 by default
cd drupal8
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd drupal8
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd drupal8
lando mysql -udrupal8 -pdrupal8 drupal8 -e quit

# Should use drush 8.1.x by default
cd drupal8
lando drush version | grep 8.1

# Should be able to install drupal
cd drupal8
lando drush si --db-url=mysql://drupal8:drupal8@database/drupal8 -y

# Should install drupal console
cd drupal8
lando composer require drupal/console:~1.0 --prefer-dist --optimize-autoloader

# Should have drupal console
cd drupal8
lando drupal -V

# Should be able to handoff to sitelocal drush without issue
cd drupal8
lando composer require drush/drush
lando rebuild -y
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
