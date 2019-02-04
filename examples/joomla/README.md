Joomla Example
==============

This example exists primarily to test the following documentation:

* [Joomla Recipe](https://docs.devwithlando.io/tutorials/joomla.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest Joomla codebase
rm -rf joomla && mkdir -p joomla && cd joomla
lando init --source remote --remote-url https://downloads.joomla.org/cms/joomla3/3-9-2/Joomla_3-9-2-Stable-Full_Package.tar.gz --recipe joomla --webroot . --name lando-joomla

# Should start up successfully
cd joomla
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the drupal installation page by default
cd joomla
lando ssh -s appserver -c "curl -L localhost" | grep "Joomla"

# Should use 7.2 as the default php version
cd joomla
lando php -v | grep 7.2

# Should be running apache 2.4 by default
cd joomla
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 5.7 by default
cd joomla
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd joomla
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd joomla
lando mysql -ujoomla -pjoomla joomla -e quit

# Should use joomla console by default
cd joomla
lando joomla -V
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd joomla
lando destroy -y
lando poweroff
```
