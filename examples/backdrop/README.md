Backdrop Example
================

This example exists primarily to test the following documentation:

* [Backdrop Recipe](https://docs.devwithlando.io/tutorials/backdrop.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest Backdrop codebase
rm -rf backdrop && mkdir -p backdrop && cd backdrop
lando init --source remote --remote-url https://github.com/backdrop/backdrop/releases/download/1.12.1/backdrop.zip --recipe backdrop --webroot backdrop --name lando-backdrop

# Should start up successfully
cd backdrop
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the drupal installation page by default
cd backdrop
lando ssh -s appserver -c "curl -L localhost" | grep "Backdrop CMS 1"

# Should use 7.2 as the default php version
cd backdrop
lando php -v | grep 7.2

# Should be running apache 2.4 by default
cd backdrop
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 5.7 by default
cd backdrop
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd backdrop
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd backdrop
lando mysql -ubackdrop -pbackdrop backdrop -e quit

# Should use drush 8.1.x by default
cd backdrop
lando drush version | grep 8.1

# Should be able to install drupal
cd backdrop/backdrop
lando drush si --db-url=mysql://backdrop:backdrop@database/backdrop -y
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd backdrop
lando destroy -y
lando poweroff
```
