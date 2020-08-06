Pantheon Drupal 7 Example
=========================

This example exists primarily to test the following documentation:

* [Pantheon Recipe - Drupal 7](https://docs.devwithlando.io/tutorials/pantheon.html)

**Note that you will need to replace (or export) `$PANTHEON_MACHINE_TOKEN` and `--pantheon-site` to values that make sense for you.**

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lando pantheon test drupal7 site
rm -rf drupal7 && mkdir -p drupal7 && cd drupal7
lando init --source pantheon --pantheon-auth "$PANTHEON_MACHINE_TOKEN" --pantheon-site landobot-drupal7

# Should start up our drupal7 site successfully
cd drupal7
lando start

# Should pull down database and files for our drupal7 site
cd drupal7
lando pull --code none --database dev --files dev --rsync
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should start with an empty cache
cd drupal7
lando mysql pantheon -e "select count(cid) from cache" | grep 0

# Should be able to bootstrap drupal7
cd drupal7
lando drush status | grep "Connected"

# Should have 755 on pulled files
cd drupal7
lando ssh -s appserver -c "stat sites/default/files/field/image/Lando-Calrissian-Cloud-City-Administrator.jpg" | grep "Access" | grep "0755"

# Should have drush
cd drupal7
lando drush version

# Should have terminus
cd drupal7
lando terminus -V

# Should be logged in
cd drupal7
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should have a binding.pem in all the right places
cd drupal7
lando ssh -s appserver -c "stat /var/www/certs/binding.pem"
lando ssh -s appserver -u root -c "stat /root/certs/binding.pem"

# Should set the correct pantheon environment
cd drupal7
lando ssh -c "env" | grep BACKDROP_SETTINGS | grep pantheon
lando ssh -c "env" | grep CACHE_HOST | grep cache
lando ssh -c "env" | grep CACHE_PORT | grep 6379
lando ssh -c "env" | grep DB_HOST | grep database
lando ssh -c "env" | grep DB_PORT | grep 3306
lando ssh -c "env" | grep DB_USER | grep pantheon
lando ssh -c "env" | grep DB_PASSWORD | grep pantheon
lando ssh -c "env" | grep DB_NAME | grep pantheon
lando ssh -c "env" | grep FRAMEWORK | grep drupal
lando ssh -c "env" | grep FILEMOUNT | grep "sites/default/files"
lando ssh -c "env" | grep PANTHEON_ENVIRONMENT | grep lando
lando ssh -c "env" | grep PANTHEON_INDEX_HOST | grep index
lando ssh -c "env" | grep PANTHEON_INDEX_PORT | grep 449
lando ssh -c "env" | grep PANTHEON_SITE | grep 6e8d4bb2-dd6f-4640-9d12-d95a942c34ca
lando ssh -c "env" | grep PANTHEON_SITE_NAME | grep landobot-drupal7
lando ssh -c "env" | grep php_version | grep "7.2"
lando ssh -c "env" | grep PRESSFLOW_SETTINGS | grep pantheon
lando ssh -c "env" | grep TERMINUS_ENV | grep dev
lando ssh -c "env" | grep TERMINUS_SITE | grep landobot-drupal7
lando ssh -c "env" | grep TERMINUS_USER | grep landobot@devwithlando.io

# Should not set any 8983 perms
cd drupal7
lando ssh -c "ls -ls /app" | grep "8983" || echo $? | grep 1

# Should be running from the root directory by default
cd drupal7
lando ssh -s appserver -c "curl -kL https://edge_ssl" | grep "Drupal 7 for Lando"
lando ssh -s appserver -c "curl -L http://edge" | grep "Drupal 7 for Lando"
lando ssh -s appserver -c "env" | grep "LANDO_WEBROOT=/app"

# Should use php version 7.2 by default for drupal7 sites
cd drupal7
lando php -v | grep "PHP 7.2"

# Should have all pantheon services running and their tooling enabled by defaults
docker ps --filter label=com.docker.compose.project=landobotdrupal7 | grep landobotdrupal7_appserver_nginx_1
docker ps --filter label=com.docker.compose.project=landobotdrupal7 | grep landobotdrupal7_appserver_1
docker ps --filter label=com.docker.compose.project=landobotdrupal7 | grep landobotdrupal7_database_1
docker ps --filter label=com.docker.compose.project=landobotdrupal7 | grep landobotdrupal7_cache_1
docker ps --filter label=com.docker.compose.project=landobotdrupal7 | grep landobotdrupal7_index_1
docker ps --filter label=com.docker.compose.project=landobotdrupal7 | grep landobotdrupal7_edge_1
docker ps --filter label=com.docker.compose.project=landobotdrupal7 | grep landobotdrupal7_edge_ssl_1

# Should not have xdebug enabled by defaults
cd drupal7
lando php -m | grep xdebug || echo $? | grep 1

# Should be serving via varnish on the proxy
cd drupal7
curl -LI http://landobot-drupal7.lndo.site | grep Via | grep varnish-v4

# Should be running nginx 1.16
cd drupal7
lando ssh -s appserver_nginx -c "/opt/bitnami/nginx/sbin/nginx -v 2>&1 | grep 1.16"

# Should have a running solr instance
cd drupal7
lando ssh -s appserver -c "curl https://index:449/sites/self/environments/lando/index/admin/"

# Should be able to push commits to pantheon
cd drupal7
lando pull --code dev --database none --files none
lando ssh -s appserver -c "git rev-parse HEAD > test.log"
lando push --code dev --database none --files none --message "Testing commit $(git rev-parse HEAD)"

# Should allow code pull from protected environments
# https://github.com/lando/lando/issues/2021
cd drupal7
lando pull --code test --database none --files none
lando pull --code live --database none --files none
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to remove our pantheon ssh keys
cp -r remove-keys.sh drupal7/remove-keys.sh
cd drupal7
lando ssh -s appserver -c "/app/remove-keys.sh $(hostname)"
cd ..
rm -rf drupal7/remove-keys.sh

# Should be able to destroy our drupal7 site with success
cd drupal7
lando destroy -y
lando poweroff
```
