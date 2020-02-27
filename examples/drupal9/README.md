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
lando init --source remote --remote-url https://ftp.drupal.org/files/projects/drupal-9.0.0-alpha1.tar.gz --remote-options="--strip-components 1" --recipe drupal9 --webroot . --name lando-drupal9

# Should copy in the .lando.local.yml
cp -f .lando.local.yml drupal9/.lando.local.yml

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

# Should not enable xdebug by default
cd drupal9
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd drupal9
lando mysql -udrupal9 -pdrupal9 drupal9 -e quit

# Should use drush 10.2.x by default
cd drupal9
lando drush version | grep 10.2

# Should be able to install drupal
cd drupal9
lando drush si --db-url=mysql://drupal9:drupal9@database/drupal9 -y

# Should install drupal console
cd drupal9
chmod -Rv 755 sites/default
lando composer require drupal/console:~1.0 --prefer-dist --optimize-autoloader

# Should have drupal console
cd drupal9
lando drupal -V

# Should be able to handoff to sitelocal drush without issue
cd drupal9
chmod -Rv 755 sites/default
lando composer require drush/drush
lando rebuild -y
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
