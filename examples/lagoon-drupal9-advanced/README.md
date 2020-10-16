Lagoon Drupal 9 Example - with Redis and Solr
=============================================

This example exists primarily to test the following documentation:

* [Lagoon Recipe - Drupal 9](https://docs.lando.dev/config/lagoon.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lagoon drupal example
rm -rf drupal && mkdir -p drupal && cd drupal
lando init --source remote --remote-url git://github.com/amazeeio/drupal-example-simple.git --remote-options="--branch 9.x-advanced" --recipe lagoon --lagoon-auth SPOOF --lagoon-site drupal9-example-simple

# Should start up our lagoon Drupal 9 site successfully
cd drupal
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to site install via drush
cd drupal
lando drush si -y
lando drush cr -y
lando drush status | grep "Drupal bootstrap" | grep "Successful"

# Should have all the services we expect
docker ps --filter label=com.docker.compose.project=drupal9exampleadvanced | grep Up | grep drupal9exampleadvanced_nginx_1
docker ps --filter label=com.docker.compose.project=drupal9exampleadvanced | grep Up | grep drupal9exampleadvanced_mariadb_1
docker ps --filter label=com.docker.compose.project=drupal9exampleadvanced | grep Up | grep drupal9exampleadvanced_mailhog_1
docker ps --filter label=com.docker.compose.project=drupal9exampleadvanced | grep Up | grep drupal9exampleadvanced_php_1
docker ps --filter label=com.docker.compose.project=drupal9exampleadvanced | grep Up | grep drupal9exampleadvanced_lagooncli_1
docker ps --filter label=com.docker.compose.project=drupal9exampleadvanced | grep Up | grep drupal9exampleadvanced_redis_1
docker ps --filter label=com.docker.compose.project=drupal9exampleadvanced | grep Up | grep drupal9exampleadvanced_solr_1

# Should ssh against the cli container by default
cd drupal
lando ssh -c "env | grep LAGOON=" | grep cli-drupal

# Should have the correct environment set
cd drupal
lando ssh -c "env" | grep LAGOON_ROUTE | grep https://drupal9-example-advanced.lndo.site
lando ssh -c "env" | grep LAGOON_ENVIRONMENT_TYPE | grep development

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

# Should have a running Drupal 9 site served by nginx on port 8080
cd drupal
lando ssh -s cli -c "curl -kL http://nginx:8080" | grep "Welcome to Drush Site-Install"

# Should be running Redis v5.0
cd drupal
lando ssh -s redis -c "redis-server --version | grep v=5."

# Should be able to see Redis databases
cd drupal
lando ssh -s redis -c "redis-cli CONFIG GET databases"

# Redis databases should be initialized
cd drupal
lando ssh -s redis -c "redis-cli dbsize"

# Should have a "drupal" Solr core
cd drupal
lando ssh -s cli -c "curl solr:8983/solr/admin/cores?action=STATUS&core=drupal"

# Should be able to reload "drupal" Solr core
cd drupal
lando ssh -s cli -c "curl solr:8983/solr/admin/cores?action=RELOAD&core=drupal"

# Check Solr has 7.x config in "drupal" core
cd drupal
lando ssh -s solr -c "cat /opt/solr/server/solr/mycores/drupal/conf/schema.xml | grep solr-7.x"

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
# Should be able to destroy our drupal9 site with success
cd drupal
lando destroy -y
lando poweroff
```
