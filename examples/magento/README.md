Magento Example
===============

This example exists primarily to test the following documentation:

* [Magento Recipe](https://docs.devwithlando.io/tutorials/magento.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Initialize an empty magento recipe
rm -rf magento && mkdir -p magento && cd magento
lando init --source cwd --recipe magento --webroot app/pub --name lando-magento

# Should build app with PHP Extensions
cd magento
lando start
lando php -i | grep "xsl"

# Should create-project install Magento app without repo.magento.com credentials
cd magento
lando composer create-project --no-install --no-plugins --repository https://repo-magento-mirror.fooman.co.nz  -- magento/project-community-edition app 2.3
cd app
lando composer config --unset repo.0
lando composer config repo.foomanmirror composer https://repo-magento-mirror.fooman.co.nz/
lando composer install
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the laravel default page
cd magento
lando ssh -s appserver -c "curl -L localhost" | grep "Magento"

# Should use 7.2 as the default php version
cd magento
lando php -v | grep "PHP 7.2"

# Should be running nginx 1.x by default
cd magento
lando ssh -s appserver_nginx -c "nginx -v 2>&1 | grep 1."
lando ssh -s appserver_nginx -c "curl -IL localhost" | grep Server | grep nginx | grep "1."

# Should be running MariaDB 10.2 by default
cd magento
lando mysql -V | grep MariaDB | grep 10.2

# Should not enable xdebug by default
cd magento
lando php -m | grep xdebug || echo $? | grep 1

# Should have default redis services running
cd magento
lando ssh -s cache -c "redis-cli CONFIG GET databases"
lando ssh -s session -c "redis-cli CONFIG GET databases"

# Should use the default database connection info
cd magento
lando mysql -umagento -pmagento magento -e quit

# Should have Magento CLI available
cd magento
lando magento list

# Should have n98-magerun CLI tooling available
cd magento
lando magerun list

# Should have 'magento:env:apply' tooling available
cd magento
lando 2>&1 >/dev/null | grep "magento:env:apply"

# Should have 'magento:fresh' tooling available
cd magento
lando 2>&1 >/dev/null | grep "magento:fresh"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd magento
lando destroy -y
lando poweroff
```
