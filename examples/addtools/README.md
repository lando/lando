Add Tooling Example
===================

See: https://docs.devwithlando.io/tutorials/setup-additional-tooling.html


Starting
--------

```bash
# Start the augmented tools example
lando start
```

Testing
-------

```bash
# Verify that we have nginx instead of apache
docker ps | grep addtools_nginx_1

# Verify our php version
lando php -v | grep PHP | grep 7.1.2

# Verify we have the phpunit cli
lando phpunit --version

# Verify we have composer
lando composer --version

# Verify we can access the DB with our custom user, password, and db
lando mysql -u lemp -plemp lemp -e"quit"

# Verify we have the git cli
lando git --version

# Verify we have the phantomjs cli
lando phantomjs -v
```

Destroying
----------

```bash
# Destroy the app
lando destroy -y
```
