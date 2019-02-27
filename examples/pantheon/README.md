Pantheon Example
================

This example exists primarily to test the following documentation:

* [Pantheon Recipe](https://docs.devwithlando.io/tutorials/pantheon.html)

**Note that you will need to replace (or export) `$PANTHEON_MACHINE_TOKEN` and `--pantheon-site` to values that make sense for you.**

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lando pantheon test wordpress site
rm -rf wordpress && mkdir -p wordpress && cd wordpress
lando init --source pantheon --pantheon-auth "$PANTHEON_MACHINE_TOKEN" --pantheon-site landobot-wordpress

# Should initialize the lando pantheon test drupal7 site
rm -rf drupal7 && mkdir -p drupal7 && cd drupal7
lando init --source pantheon --pantheon-auth "$PANTHEON_MACHINE_TOKEN" --pantheon-site landobot-drupal7

# Should start up our wordpress site successfully
cd wordpress
lando start

# Should start up our drupal7 site successfully
cd drupal7
lando start

# Should pull down database and files for our wordpress site
cd wordpress
lando pull --code none --database dev --files dev

# Should pull down database and files for our drupal7 site
cd drupal7
lando pull --code none --database dev --files dev --rsync
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to bootstrap wordpress
cd wordpress/web
lando wp eval "phpinfo();"

# Should have wp cli
cd wordpress
lando wp cli version

# Should use custom webroot when set in pantheon.yml
cd wordpress
lando ssh -s appserver -c "curl -L http://appserver_nginx" | grep "WordPress for Lando"
lando ssh -s appserver -c "curl -kL https://appserver_nginx" | grep "WordPress for Lando"
lando ssh -s appserver -c "env" | grep "LANDO_WEBROOT=/app/web"

# Should set /var/www/.wp-cli/config.yml with LANDO_WEBROOT as PATH
cd wordpress
lando ssh -s appserver -c "cat /var/www/.wp-cli/config.yml | grep path | grep /app/web"

# Should have terminus
cd wordpress
lando terminus -V

# Should be logged in
cd wordpress
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should use custom php version if set in pantheon.yml
cd wordpress
lando php -v | grep "PHP 7.0"

# Should set the correct wordpress specific pantheon environment
cd wordpress
lando ssh -c "env" | grep FRAMEWORK | grep wordpress
lando ssh -c "env" | grep FILEMOUNT | grep "wp-content/uploads"

# Should disable edge, index or cache containers and tools when specified
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_appserver_nginx_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_appserver_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_database_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_cache_1 || echo $? | grep 1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_index_1 || echo $? | grep 1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_edge_1 || echo $? | grep 1

# Should still be logged in even after a rebuild
cd wordpress
lando terminus auth:whoami | grep landobot@devwithlando.io
lando rebuild -y
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should serve proxy from nginx
cd wordpress
curl -LI http://landobot-wordress.lndo.site | grep Via || echo $? | grep 1

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
lando ssh -c "env" | grep TERMINUS_TOKEN | grep _wD
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

# Should have a running solr instance
cd drupal7
lando ssh -s appserver -c "curl https://index:449/sites/self/environments/lando/index/admin/"

# Should be able to push commits to pantheon
cd drupal7
lando ssh -s appserver -c "git rev-parse HEAD > test.log"
lando push --code dev --database none --files none --message "Testing commit $(git rev-parse HEAD)"
cd ..
cd wordpress
lando ssh -s appserver -c "git rev-parse HEAD > test.log"
lando push --code dev --database none --files none --message "Testing commit $(git rev-parse HEAD)"
cd ..
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to remove our pantheon ssh keys
cp -r remove-keys.sh drupal7/remove-keys.sh
cp -r remove-keys.sh wordpress/remove-keys.sh
cd wordpress
lando ssh -s appserver -c "/app/remove-keys.sh $(hostname)"
cd ..
cd drupal7
lando ssh -s appserver -c "/app/remove-keys.sh $(hostname)"
cd ..
rm -rf drupal7/remove-keys.sh
rm -rf wordpress/remove-keys.sh

# Should be able to destroy our wordpress site with success
cd wordpress
lando destroy -y
lando poweroff

# Should be able to destroy our drupal7 site with success
cd drupal7
lando destroy -y
lando poweroff
```
