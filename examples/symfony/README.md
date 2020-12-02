Symfony Example
===============

This example exists primarily to test the following documentation:

* [Symfony Recipe](https://docs.devwithlando.io/tutorials/symfony.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Initialize an empty Symfony recipe
rm -rf symfony && mkdir -p symfony && cd symfony
lando init --source cwd --recipe symfony --webroot /app/public --name lando-symfony --option cache=redis

# Should compose create-project a new symfony app
cd symfony
lando composer create-project symfony/website-skeleton tmp && cp -r tmp/. . && rm -rf tmp

# Should start up successfully
cd symfony
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should use 7.4 as the default php version
cd symfony
lando php -v | grep "PHP 7.4"

# Should be running apache 2.4 by default
cd symfony
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 5.7 by default
cd symfony
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd symfony
lando php -m | grep xdebug || echo $? | grep 1

# Should have redis running
cd symfony
lando ssh -s cache -c "redis-cli CONFIG GET databases"

# Should use the default database connection info
cd symfony
lando mysql -usymfony -psymfony symfony -e quit

# Should have console available
cd symfony
lando composer list
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd symfony
lando destroy -y
lando poweroff
```
