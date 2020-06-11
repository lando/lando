Platform.sh Kitchen Sink Example
================================

This example exists primarily to test the following documentation:

* [Platform.sh Recipe](https://docs.lando.dev/config/platformsh.html)

In particular its designed to test all the services, application containers, relationship
and various multiapp setups.

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

# Should initialize the platformsh lando-d8 example
rm -rf sink && mkdir -p sink && cd sink
lando init --source platformsh --platformsh-auth "$PLATFORMSH_CLI_TOKEN" --platformsh-site lando-kitchensink --platformsh-key-name "$CIRCLE_SHA1"

# Should start up our platformsh site successfully
cd sink
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to bootstrap sink 8
cd sink/web
lando ssh -c "drush status" | grep Database | grep Connected

# Should have php application container tooling commands
cd sink
lando composer -v
lando php -v

# Should have the platform cli
cd sink
lando platform -V

# Should be logged in
cd sink
lando platform auth:info | grep landobot@lando.dev

# Should have a tooling command for each relationship
cd sink
lando database main -e "show tables;" | grep users

# Should ssh into the app service by default
cd sink
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep app

# Should set the correct platform environment
cd sink
lando ssh -c "env" | grep PLATFORM_APPLICATION
lando ssh -c "env" | grep PLATFORM_BRANCH
lando ssh -c "env" | grep PLATFORM_VARIABLES
lando ssh -c "env" | grep PLATFORM_ROUTES
lando ssh -c "env" | grep PLATFORM_RELATIONSHIPS
lando ssh -c "env" | grep PLATFORM_APP_DIR | grep /app
lando ssh -c "env" | grep PLATFORM_APPLICATION_NAME | grep app
lando ssh -c "env" | grep PLATFORM_ENVIRONMENT | grep lando
lando ssh -c "env" | grep PLATFORM_TREE_ID | grep 5su5nuuuwr5xg-app
lando ssh -c "env" | grep PLATFORM_DIR | grep /app
lando ssh -c "env" | grep PLATFORM_PROJECT | grep 5su5nuuuwr5xg
lando ssh -c "env" | grep PLATFORM_PROJECT_ENTROPY | grep heatdeath
lando ssh -c "env" | grep PLATFORM_APP_COMMAND | grep /usr/sbin/php-fpm
lando ssh -c "env" | grep PLATFORM_DOCUMENT_ROOT | grep /app/web
lando ssh -c "env" | grep PLATFORMSH_CLI_TOKEN | grep e_
lando ssh -c "env" | grep PLATFORMSH_CLI_HOME | grep /var/www

# Should be running services with the correct user
cd sink
lando ssh -c "id" | grep web
lando ssh -s db -c "id" | grep app
lando ssh -s cache -c "id" | grep app

# Should use the correct php version
cd sink
lando php -v | grep "PHP 7.2"

# Should have the expected platformsh containers and images
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_app_1
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_cache_1
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_db_1
docker ps --filter label=com.docker.compose.project=landod8 | grep landod8_app_1
docker ps --filter label=com.docker.compose.project=landod8 | grep docker.registry.platform.sh/php-7.2
docker ps --filter label=com.docker.compose.project=landod8 | grep docker.registry.platform.sh/redis-5.0
docker ps --filter label=com.docker.compose.project=landod8 | grep docker.registry.platform.sh/mariadb-10.2

# Should be able to persist the sink database after a rebuild
cd sink
lando rebuild -y
lando database main -e "show tables;" | grep users
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to remove our platformsh ssh keys
cp -r remove-keys.sh sink/remove-keys.sh
cd sink
lando ssh -s appserver -c "/app/remove-keys.sh $CIRCLE_SHA1"
cd ..
rm -rf sink/remove-keys.sh

# Should be able to destroy our platformsh site with success
cd sink
lando destroy -y
lando poweroff
```
