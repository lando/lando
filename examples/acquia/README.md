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

# Should initialize the lando acquia test drupal9 site
rm -rf drupal9 && mkdir -p drupal9 && cd drupal9
lando init --source acquia --acquia-key "$ACQUIA_API_KEY" --acquia-secret "$ACQUIA_API_SECRET" --acquia-app "53fd24cf-803f-4024-afac-c457cfc5c273" --acquia-key-name "$CIRCLE_SHA1"

# Should start up our drupal9 site successfully
cd drupal9
lando start

# Should pull down database and files for our drupal9 site
cd drupal9
lando pull --code dev --database dev --files dev
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should have drush
cd drupal9
lando drush version

# Should have acli
cd drupal9
lando acli -V

# Should have site local drush 10
cd drupal9
lando ssh -s appserver -c "which drush" | grep "/app/vendor/bin/drush"
lando drush --no-ansi --version | grep "Drush Commandline Tool 10."

# Should have globally installed drush 8 as fallback
cd drupal9
lando ssh -s appserver -c "cd /tmp && /usr/local/bin/drush --version" | grep "Drush Version" | grep "8.4."

# Should use composer 2.x by default
cd drupal9
lando composer --version | grep Composer | grep 2.

# Should be able to specify the composer version
cd drupal9
lando ssh -c "/usr/local/bin/composer --version" | grep Composer | grep "2.0.11"

# Should use php version 7.4 by default
cd drupal9
lando php -v | grep "PHP 7.4"

# Should be able to bootstrap drupal9
cd drupal9
lando drush status | grep "Database" | grep "Connected"

# Should set the correct envvars
cd drupal9
lando ssh -c "env" | grep AH_SITE_ENVIRONMENT | grep LANDO
lando ssh -c "env" | grep AH_SITE_GROUP | grep engagedemo
lando ssh -c "env" | grep AH_SITE_UUID | grep 53fd24cf-803f-4024-afac-c457cfc5c273

# Should be running from the docroot directory
cd drupal9
lando ssh -s appserver -c "env" | grep "LANDO_WEBROOT=/app/docroot"

# Should have all acquia services running and their tooling enabled by defaults
docker ps --filter label=com.docker.compose.project=engagedemo | grep engagedemo_appserver_1
docker ps --filter label=com.docker.compose.project=engagedemo | grep engagedemo_database_1
docker ps --filter label=com.docker.compose.project=engagedemo | grep engagedemo_cache_1
docker ps --filter label=com.docker.compose.project=engagedemo | grep engagedemo_inbox_1

# Should not have xdebug enabled by defaults
cd drupal9
lando php -m | grep xdebug || echo $? | grep 1

# Should be running apache 2.4
cd drupal9
lando ssh -s appserver -c "apachectl -V | grep 2.4."
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to destroy our drupal9 site with success
cd drupal9
lando destroy -y
lando poweroff
```

TODO
----

```bash
# Should be able to remove our acquia ssh keys
cp -r remove-keys.sh drupal9/remove-keys.sh
cd drupal9
lando ssh -s appserver -u root -c "apt-get update -y"
lando ssh -s appserver -u root -c "apt-get install jq -y"
lando ssh -s appserver -c "/app/remove-keys.sh $ACQUIA_API_KEY $ACQUIA_API_SECRET $CIRCLE_SHA1"
cd ..
rm -rf drupal9/remove-keys.sh
```
