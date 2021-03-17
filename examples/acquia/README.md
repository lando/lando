Acquia Drupal 9 Example
=======================

This example exists primarily to test the following documentation:

* [Acquia Recipe](https://docs.lando.dev/config/acquia.html)

**Note that you will need to replace (or export) `$ACQUIA_API_KEY`, `$ACQUIA_API_SECRET` and `--acquia-app` to values that make sense for you.**

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should enable experimental mode
# @TOOD: remove this when we dont need it anymore
lando --experimental

# Should initialize the lando pantheon test drupal9 site
rm -rf drupal9 && mkdir -p drupal9 && cd drupal9
lando init --source acquia --acquia-key "$ACQUIA_API_KEY" --acquia-secret "$ACQUIA_API_SECRET" --acquia-app "53fd24cf-803f-4024-afac-c457cfc5c273"

# Should start up our drupal9 site successfully
cd drupal9
lando start

# Should pull down database and files for our drupal9 site
cd drupal9
lando pull --code none --database dev --files dev --rsync
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to bootstrap drupal9
cd drupal9
lando drush status | grep "Connected"

# Should have 755 on pulled files
cd drupal9
lando ssh -s appserver -c "stat sites/default/files/field/image/Lando-Calrissian-Cloud-City-Administrator.jpg" | grep "Access" | grep "0755"

# Should have drush
cd drupal9
lando drush version

# Should have terminus
cd drupal9
lando terminus -V

# Should use composer 2.x
cd drupal9
lando composer --version | grep Composer | grep 2.

# Should be logged in
cd drupal9
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should have a binding.pem in all the right places
cd drupal9
lando ssh -s appserver -c "stat /var/www/certs/binding.pem"
lando ssh -s appserver -u root -c "stat /root/certs/binding.pem"

# Should set the correct pantheon environment
cd drupal9
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
lando ssh -c "env" | grep PANTHEON_SITE_NAME | grep landobot-drupal9
lando ssh -c "env" | grep php_version | grep "7.2"
lando ssh -c "env" | grep PRESSFLOW_SETTINGS | grep pantheon
lando ssh -c "env" | grep TERMINUS_ENV | grep dev
lando ssh -c "env" | grep TERMINUS_SITE | grep landobot-drupal9
lando ssh -c "env" | grep TERMINUS_USER | grep landobot@devwithlando.io

# Should not set any 8983 perms
cd drupal9
lando ssh -c "ls -ls /app" | grep "8983" || echo $? | grep 1

# Should be running from the root directory by default
cd drupal9
lando ssh -s appserver -c "curl -kL https://edge_ssl" | grep "Drupal 7 for Lando"
lando ssh -s appserver -c "curl -L http://edge" | grep "Drupal 7 for Lando"
lando ssh -s appserver -c "env" | grep "LANDO_WEBROOT=/app"

# Should use php version 7.2 by default for drupal9 sites
cd drupal9
lando php -v | grep "PHP 7.2"

# Should have all pantheon services running and their tooling enabled by defaults
docker ps --filter label=com.docker.compose.project=landobotdrupal9 | grep landobotdrupal9_appserver_nginx_1
docker ps --filter label=com.docker.compose.project=landobotdrupal9 | grep landobotdrupal9_appserver_1
docker ps --filter label=com.docker.compose.project=landobotdrupal9 | grep landobotdrupal9_database_1
docker ps --filter label=com.docker.compose.project=landobotdrupal9 | grep landobotdrupal9_cache_1
docker ps --filter label=com.docker.compose.project=landobotdrupal9 | grep landobotdrupal9_index_1
docker ps --filter label=com.docker.compose.project=landobotdrupal9 | grep landobotdrupal9_edge_1
docker ps --filter label=com.docker.compose.project=landobotdrupal9 | grep landobotdrupal9_edge_ssl_1

# Should not have xdebug enabled by defaults
cd drupal9
lando php -m | grep xdebug || echo $? | grep 1

# Should be serving via varnish on the proxy
cd drupal9
curl -LI http://landobot-drupal9.lndo.site | grep Via | grep varnish-v4

# Should be running nginx 1.16
cd drupal9
lando ssh -s appserver_nginx -c "/opt/bitnami/nginx/sbin/nginx -v 2>&1 | grep 1.16"

# Should have a running solr instance
cd drupal9
lando ssh -s appserver -c "curl https://index:449/sites/self/environments/lando/index/admin/"

# Should be able to push commits to pantheon
cd drupal9
lando pull --code dev --database none --files none
lando ssh -s appserver -c "git rev-parse HEAD > test.log"
lando push --code dev --database none --files none --message "Testing commit $(git rev-parse HEAD)"

# Should allow code pull from protected environments
# https://github.com/lando/lando/issues/2021
cd drupal9
lando pull --code test --database none --files none
lando pull --code live --database none --files none
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to remove our pantheon ssh keys
cp -r remove-keys.sh drupal9/remove-keys.sh
cd drupal9
lando ssh -s appserver -c "/app/remove-keys.sh $(hostname)"
cd ..
rm -rf drupal9/remove-keys.sh

# Should be able to destroy our drupal9 site with success
cd drupal9
lando destroy -y
lando poweroff
```
