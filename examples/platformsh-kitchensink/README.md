Platform.sh Kitchen Sink Example
================================

This example exists primarily to test the following documentation:

* [Platform.sh Recipe](https://docs.lando.dev/config/platformsh.html)

In particular its designed to test:

* Multiapplication configuration
* All the services and their config
* All application containers and their config
* Using application `relationships` from `lando` and the applications themselves
* The platform.sh documentation on how to connect from an application to a service via a `relationship`

Here are some general guidelines for adding and testing a services:

### 1. Add the service

Add a service to `.platform/services.yaml`. Try to use one of the more complex configurations from the platform.sh docs.

### 2. Update the application config

Add any needed `extensions` or `relationships` to the applications, currently just `php`, in `.platform.yaml/applications.yaml`.

### 3. Add a testing script

Add a script that tests the service from the given application eg `php/web/redis.php` for the `php` application. The testing scripts here are taken almost verbatim from the platform.sh docs. For example: https://docs.platform.sh/configuration/services/redis.html#usage-example.

### 4. Add tests below

There is a repeatable pattern for application containers and services below. Generally these should include things like:

1. Is it runnning the right version?
2. Can I connect to it using the `lando <RELATIONSHIPNAME>` command?
3. Is its custom configuration being set correctly?
4. Does its data persist across a rebuild if needed?
5. Can I connect to it from a given application container?
6. Can I pull/push the relationship?

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

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
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/php-7.4 | grep landokitchensink_base_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/php-7.2 | grep landokitchensink_discreet_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/php-7.3 | grep landokitchensink_php_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/mariadb-10.2 | grep landokitchensink_db_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/memcached-1.6 | grep landokitchensink_memcache_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/mariadb-10.4 | grep landokitchensink_mysql_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/postgresql-11| grep landokitchensink_postgres_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/redis-5.0 | grep landokitchensink_redis_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/kafka-2.4 | grep landokitchensink_kafka_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/varnish-6.0 | grep landokitchensink_varnish_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/mongodb-3.6 | grep landokitchensink_dbmongo_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/influxdb-1.7 | grep landokitchensink_influxdb_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/elasticsearch-7.7 | grep landokitchensink_searchelastic_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/rabbitmq-3.8 | grep landokitchensink_rabbitmq_1
docker ps --filter label=com.docker.compose.project=landokitchensink | grep docker.registry.platform.sh/solr-8.0 | grep landokitchensink_search_1

# Should use tooling based on the closest application
cd sink
lando php -v | grep "PHP 7.4"
lando composer -v
lando database main -e "show tables"
cd discreet
lando php -v | grep "PHP 7.2"
lando composer -v
cd ../php
lando php -v | grep "PHP 7.3"
lando composer -v
lando maria main -e "show tables"

# Should configure the webroot for each application correctly
cd sink
lando ssh -c "curl localhost" | grep base
cd discreet
lando ssh -c "curl localhost" | grep discreet

# Should be running all application containers as web
cd sink
lando ssh -s base -c "id" | grep web
lando ssh -s discreet -c "id" | grep web
lando ssh -s php -c "id" | grep web

# Should set the correct default ssh service based on nearest application
cd sink
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep base
cd discreet
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep discreet
cd ../php
lando ssh -c "env" | grep LANDO_SERVICE_NAME | grep php

# Should have the platform cli in ALL application containers
cd sink
lando ssh -s base -c "platform -V"
lando ssh -s discreet -c "platform -V"
lando ssh -s php -c "platform -V"

# Should be logged in
cd sink
lando platform auth:info | grep landobot@lando.dev

# Should have the redis extension installed
cd sink/php
lando php -m | grep redis

# Should be running the correct mariadb version
cd sink/php
lando ssh -s db -c "mysql -V" | grep 10.2.

# Should be able to connect to all mariadb relationships
cd sink/php
lando maria main -e "show tables"

# Should be running mariadb with the correct user
cd sink/php
lando ssh -s db -c "id" | grep app

# Should be running the correct memcache version
cd sink/php
lando ssh -s memcache -c "memcached -V" | grep 1.6.

# Should be running memcache on the correct port
docker top landokitchensink_memcache_1 | grep /usr/bin/memcached | grep 11211

# Should be running memcache with the correct user
cd sink/php
lando ssh -s memcache -c "id" | grep app

# Should be able to connect to memcache from the application containers
cd sink/php
lando ssh -c "curl -I localhost/memcached.php" | grep HTTP/1.1 | grep "200 OK"

# Should be running the correct version of mysql
cd sink/php
lando ssh -s mysql -c "mysql -V" | grep 10.4.

# Should be able to connect to all mysql relationships
cd sink/php
lando admin main -e "show tables;"
lando admin legacy -e "show tables;"
lando imports legacy -e "show tables;"

# Should be running mysql with the correct user
cd sink/php
lando ssh -s mysql -c "id" | grep app

# Should be able to connect to mysql from the application containers
cd sink/php
lando ssh -c "curl -I localhost/mysql.php" | grep HTTP/1.1 | grep "200 OK"

# Should be running the correct postgres version
cd sink/php
lando ssh -s postgres -c "/usr/lib/postgresql/11/bin/postgres -V" | grep 11.

# Should be able to connect to all postgres relationships
cd sink/php
lando postgres -c "\\dt"

# Should have the correct postgres extensions installed
cd sink/php
lando postgres -c "\\dx" | grep hstore
lando postgres -c "\\dx" | grep pg_trgm

# Should be able to connect to postgres from the application containers
cd sink/php
lando ssh -c "curl -I localhost/postgres.php" | grep HTTP/1.1 | grep "200 OK"

# Should be running postgres with the correct user
cd sink/php
lando ssh -s postgres -c "id" | grep postgres

# Should run the correct version of redis
cd sink/php
lando ssh -s redis -c "redis-server --version" | grep v=5.0.

# Should be able to connect to all redis relationships
cd sink/php
lando redis ping

# Should have the correct eviction policy
cd sink/php
lando ssh -s redis -c "cat /etc/redis/redis.conf" | grep maxmemory-policy | grep noeviction

# Should run redis as the correct user
cd sink/php
lando ssh -s redis -c "id" | grep app

# Should be able to connect to redis from the application containers
cd sink/php
lando ssh -c "curl -I localhost/redis.php" | grep HTTP/1.1 | grep "200 OK"

# Should run the correct version of elasticsearch
cd sink/php
lando ssh -s searchelastic -c "curl localhost:9200" | grep "7.7"

# Should have an elasticsearch cluster status of green
cd sink/php
lando ssh -s searchelastic -c "curl localhost:9200/_cluster/health?pretty" | grep green

# Should run elasticsearch as the correct user
cd sink/php
lando ssh -s searchelastic -c "id" | grep elasticsearch

# Should be able to connect to work with elasticsearch indices from php
cd sink/php
lando ssh -c "curl localhost/elasticsearch.php" | grep "Barbara Liskov"

# Should run the correct version of solr
cd sink/php
lando ssh -s search -c "curl localhost:8080/solr/admin/info/system?wt=json" | grep solr-spec-version | grep "8.0"

# Should run php solr commands successfully
cd sink/php
lando ssh -c "curl localhost/solr.php" | grep "Result" | grep "OK"

# Should run php mongodb commands successfully
cd sink/php
lando ssh -c "curl localhost/mongodb.php" | grep "Result" | grep "OK"

# Should have OS Pid when running rabbitmqctl status
cd sink/php
lando ssh -u root -s rabbitmq -c "rabbitmqctl status" | egrep "OS PID: [0-9]+"

# Should load rabbitmq management page
cd sink/php
lando ssh -s rabbitmq -c "curl localhost:15672" | grep "RabbitMQ Management"

# Should run php rabbitmq php commands successfully
cd sink/php
lando ssh -c "curl localhost/rabbitmq.php" | grep "Result" | grep "OK"

# Should show influxdb process running as the app user
cd sink/php
lando ssh -u root -s influxdb -c "ps aux|grep influxdb" | grep "^app"

# Should show kafka process running
cd sink/php
lando ssh -u root -s kafka -c "ps aux" | grep runsv | grep kafka

# Should connect to the correct backend from varnish
cd sink/php
lando ssh -s varnish -c "curl localhost:8080" | grep discreet

# Should be able to connect to varnish stats endpoint
cd sink/php
lando ssh -s varnish -c "curl localhost:8081/config" | grep backend | grep test_1
lando ssh -s varnish -c "curl localhost:8081/config" | grep "req.backend_hint" | grep "test.backend()"

# Should find chromium service
cd sink/php
lando ssh -s chromium -c "ps -aux" | grep "chromium-headless"

# Should run chromium php page
cd sink/php
lando ssh -c "curl localhost/chromium.php" | grep "Result" | grep "OK"
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
