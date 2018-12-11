Add Services Example
====================

See: https://docs.devwithlando.io/tutorials/setup-additional-services.html

Starting
--------

```bash
# Start the augmented services example
lando start
```

Testing
-------

```bash
# Verify our php version
lando php -v | grep PHP | grep 7.1.2

# Verify our custom php mem limit
lando php -i | grep memory_limit | grep 1023M

# Verify we have the phpunit cli
lando phpunit --version

# Verify we can access the DB with our custom user, password, and db
lando mysql -u tswift -ptroubletroubletrouble songz -e"quit"

# Verify our DB portforward is dialed
docker inspect addservices_database_1 | grep HostPort | grep 1337
lando info | grep 1337

# Verify we have the node cli at the correct version
lando node -v | grep v6.10.

# Verify we have npm
lando npm -v

# Verify we have gulp
lando gulp -v

# Verify we have vim
lando vim --version

# Verify that redis was started in append only mode
docker inspect addservices_cache_1 | grep appendonly
```

Destroying
----------

```bash
# Destroy the app
lando destroy -y
```
