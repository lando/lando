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

# Should initialize the platformsh lando-kitchensink example
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
# Should have the expected platformsh containers and images
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/mariadb-10.2 | grep landokitchensink_db_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/php-7.2 | grep landokitchensink_discreet_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/php-7.3 | grep landokitchensink_base_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/php-7.4 | grep landokitchensink_php_1

# Should use tooling based on the closest application
cd sink
lando php -v | grep "PHP 7.3"
lando composer -v
lando database main -e "show tables"
cd discreet
lando php -v | grep "PHP 7.2"
lando composer -v
cd ../php
lando php -v | grep "PHP 7.4"
lando composer -v
lando maria main -e "show tables"

# Should set the correct default ssh
cd sink
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep base
cd discreet
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep discreet
cd ../php
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep php

# Should be running services with the correct user
cd sink
lando ssh -s base -c "id" | grep web
lando ssh -s discreet -c "id" | grep web
lando ssh -s php -c "id" | grep web
lando ssh -s db -c "id" | grep app

# Should have the platform cli in application containers
cd sink
lando ssh -s base -c "platform -V"
lando ssh -s discreet -c "platform -V"
lando ssh -s php -c "platform -V"

# Should be logged in
cd sink
lando platform auth:info | grep landobot@lando.dev

# Should have custom mysql relationships
cd sink/php
lando admin main -e "show tables"
lando imports legacy -e "show tables"
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
