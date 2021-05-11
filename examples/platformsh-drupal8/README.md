Platform.sh Drupal 8 Example
============================

This example exists primarily to test the following documentation:

* [Platform.sh Recipe - Drupal 8](https://docs.lando.dev/config/platformsh.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the platformsh lando-d8 example
rm -rf drupal && mkdir -p drupal && cd drupal
lando init --source platformsh --platformsh-auth "$PLATFORMSH_CLI_TOKEN" --platformsh-site lando-d8 --platformsh-key-name "$CIRCLE_SHA1"

# Should start up our platformsh drupal 8 site successfully
cd drupal
lando start

# Should pull down database and files for our drupal8 site
cd drupal
lando pull -r database -m web/sites/default/files
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to bootstrap drupal 8
cd drupal/web
lando ssh -c "drush status" | grep Database | grep Connected

# Should have php application container tooling commands
cd drupal
lando composer -v
lando php -v

# Should have the platform cli
cd drupal
lando platform -V

# Should be logged in
cd drupal
lando platform auth:info | grep landobot@lando.dev

# Should have a tooling command for each relationship
cd drupal
lando database main -e "show tables;" | grep users

# Should ssh into the app service by default
cd drupal
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep app

# Should set the correct platform environment
cd drupal
lando ssh -c "env" | grep PLATFORM_APPLICATION
lando ssh -c "env" | grep PLATFORM_BRANCH
lando ssh -c "env" | grep PLATFORM_VARIABLES
lando ssh -c "env" | grep PLATFORM_ROUTES
lando ssh -c "env" | grep PLATFORM_RELATIONSHIPS
lando ssh -c "env" | grep PLATFORM_PROJECT_ENTROPY
lando ssh -c "env" | grep PLATFORM_APP_DIR | grep /app
lando ssh -c "env" | grep PLATFORM_APPLICATION_NAME | grep app
lando ssh -c "env" | grep PLATFORM_ENVIRONMENT | grep lando
lando ssh -c "env" | grep PLATFORM_TREE_ID | grep 5su5nuuuwr5xg-app
lando ssh -c "env" | grep PLATFORM_DIR | grep /app
lando ssh -c "env" | grep PLATFORM_PROJECT | grep 5su5nuuuwr5xg
lando ssh -c "env" | grep PLATFORM_APP_COMMAND | grep /usr/sbin/php-fpm
lando ssh -c "env" | grep PLATFORM_DOCUMENT_ROOT | grep /app/web
lando ssh -c "env" | grep PLATFORMSH_CLI_TOKEN | grep e_
lando ssh -c "env" | grep PLATFORMSH_CLI_HOME | grep /var/www

# Should be running services with the correct user
cd drupal
lando ssh -c "id" | grep web
lando ssh -s db -c "id" | grep app
lando ssh -s cache -c "id" | grep app

# Should use the correct php version
cd drupal
lando php -v | grep "PHP 7.4"

# Should have the expected platformsh containers and images
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_app_1
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_cache_1
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_db_1
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_app_1
docker ps --filter label=com.docker.compose.project=landod8 | grep docker.registry.platform.sh/php-7.4
docker ps --filter label=com.docker.compose.project=landod8 | grep docker.registry.platform.sh/redis-6.0
docker ps --filter label=com.docker.compose.project=landod8 | grep docker.registry.platform.sh/mariadb-10.4

# Should allow for service portforward overrides
cd drupal
lando info -s db --path "[0]external_connection.port" | grep 3307

# Should support legacy variable overrides
cd drupal
lando ssh -c "env" | grep LOCAL_OVERRIDE | grep itdonehappened

# Should support local application overrides
cd drupal
lando ssh -c "env" | grep LOCAL_OVERRIDE2 | grep stillhappening

# Should support local service overrides
cd drupal
lando database main -e "show variables;" | grep max_allowed_packet | grep 66060288

# Should connect to remote platform environment and not local
cd drupal
lando platform relationships | grep hostname | grep platformsh.site

# Should be able to persist the drupal database after a rebuild
cd drupal
lando rebuild -y
lando database main -e "show tables;" | grep users

# Should restart correctly
cd drupal
lando restart
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to remove our platformsh ssh keys
cp -r remove-keys.sh drupal/remove-keys.sh
cd drupal
lando ssh -s appserver -c "/app/remove-keys.sh $CIRCLE_SHA1"
cd ..
rm -rf drupal/remove-keys.sh

# Should be able to destroy our platformsh site with success
cd drupal
lando destroy -y
lando poweroff
```
