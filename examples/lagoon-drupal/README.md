Lagoon Drupal 8 Example
=======================

This example exists primarily to test the following documentation:

* [Lagoon Recipe - Drupal 8](https://docs.lando.dev/config/lagoon.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should be running in experimental mode
lando config | grep experimental | grep true || lando --experimental
lando config | grep experimental | grep true
lando config | grep experimentalPluginLoadTest | grep true

# Should initialize the lagoon drupal example
rm -rf drupal && mkdir -p drupal && cd drupal
lando init --source remote --remote-url https://github.com/amazeeio/drupal-example.git --recipe lagoon

# Should start up our lagoon drupal 8 site successfully
cd drupal
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to site install via drush
# NOTE: The steps to get to a clean install here are sorta weird
cd drupal
lando drush site-install config_installer -y || true
cd web
lando drush status || true
lando drush cr
lando drush status | grep "Drupal bootstrap" | grep "Successful"

# Should have all the services we expect
docker ps --filter label=com.docker.compose.project=drupalexample | grep Up | grep drupalexample_nginx_1
docker ps --filter label=com.docker.compose.project=drupalexample | grep Up | grep drupalexample_redis_1
docker ps --filter label=com.docker.compose.project=drupalexample | grep Up | grep drupalexample_mariadb_1
docker ps --filter label=com.docker.compose.project=drupalexample | grep Up | grep drupalexample_solr_1
docker ps --filter label=com.docker.compose.project=drupalexample | grep Up | grep drupalexample_mailhog_1
docker ps --filter label=com.docker.compose.project=drupalexample | grep Up | grep drupalexample_php_1
docker ps --filter label=com.docker.compose.project=drupalexample | grep Up | grep drupalexample_cli_1

# Should have composer
cd drupal
lando composer --version

# Should have php cli
cd drupal
lando php --version

# Should have drush
cd drupal
lando drush --version

# Should have npm
cd drupal
lando npm --version

# Should have node
cd drupal
lando node --version

# Should have yarn
cd drupal
lando yarn --version

# Should have a running drupal 8 site served by nginx on port 8080
cd drupal
lando ssh -s cli -c "curl -kL http://nginx:8080" | grep "Welcome to Site-Install"

# Should be able to db-export and db-import the database
cd drupal
lando db-export test.sql
lando db-import test.sql.gz

# Should be able to show the drupal tables
cd drupal
lando mysql drupal -e "show tables;" | grep users

# Shoud be able to rebuild and persist the database
cd drupal
lando rebuild -y
lando mysql drupal -e "show tables;" | grep users
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to destroy our drupal7 site with success
cd drupal
lando destroy -y
lando poweroff
```
