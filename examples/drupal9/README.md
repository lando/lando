Drupal 9 Example
================

This example exists primarily to test the following documentation:

* [Drupal 9 Recipe](https://docs.devwithlando.io/tutorials/drupal9.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest Drupal 9 codebase
rm -rf drupal9 && mkdir -p drupal9 && cd drupal9
lando init --source remote --remote-url https://www.drupal.org/download-latest/tar.gz --remote-options="--strip-components 1" --recipe drupal9 --webroot . --name lando-drupal9

# Should start up successfully
cd drupal9
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the drupal installation page by default
cd drupal9
lando ssh -s appserver -c "curl -L localhost" | grep "Drupal 9"

# Should use 7.3 as the default php version
cd drupal9
lando php -v | grep "PHP 7.3"

# Should be running apache 2.4 by default
cd drupal9
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 5.7 by default
cd drupal9
lando mysql -V | grep 5.7

# Should be running sqlite 3.26.0 by default
cd drupal9
lando php -r "print_r(SQLite3::version());" | grep versionString | grep 3.26

# Should not enable xdebug by default
cd drupal9
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd drupal9
lando mysql -udrupal9 -pdrupal9 drupal9 -e quit

# Should use site-local drush if installed
cd drupal9
lando composer require drush/drush
lando ssh -c "which drush" | grep "/app/vendor/bin/drush"

# Should be able to install drupal
cd drupal9
lando drush si --db-url=mysql://drupal9:drupal9@database/drupal9 -y
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd drupal9
lando destroy -y
lando poweroff
```
