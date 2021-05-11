Drupal 6 Example
================

This example exists primarily to test the following documentation:

* [Drupal 6 Recipe](https://docs.devwithlando.io/tutorials/drupal6.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest D6 codebase
rm -rf drupal6 && mkdir -p drupal6 && cd drupal6
lando init --source remote --remote-url https://ftp.drupal.org/files/projects/drupal-6.38.tar.gz --remote-options="--strip-components 1" --recipe drupal6 --webroot . --name lando-drupal6

# Should start up successfully
cd drupal6
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the drupal installation page by default
cd drupal6
lando ssh -s appserver -c "curl -L localhost" | grep "Choose language"

# Should use 5.6 as the default php version
cd drupal6
lando php -v | grep "PHP 5.6"

# Should be running apache 2.4 by default
cd drupal6
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 5.7 by default
cd drupal6
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd drupal6
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd drupal6
lando mysql -udrupal6 -pdrupal6 drupal6 -e quit

# Should use drush 8.4.5 by default
cd drupal6
lando drush version | grep "8.4.5"

# Should be able to install drupal
cd drupal6
lando drush si --db-url=mysql://drupal6:drupal6@database/drupal6 -y
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd drupal6
lando destroy -y
lando poweroff
```
