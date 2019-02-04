WordPress Example
=================

This example exists primarily to test the following documentation:

* [WordPress Recipe](https://docs.devwithlando.io/tutorials/wordpress.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest WordPress codebase
rm -rf wordpress && mkdir -p wordpress && cd wordpress
lando init --source remote --remote-url https://wordpress.org/latest.tar.gz --recipe wordpress --webroot wordpress --name lando-wordpress

# Should start up successfully
cd wordpress
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return the WordPress installation page by default
cd wordpress
lando ssh -s appserver -c "curl -L localhost" | grep "WordPress"

# Should use 7.2 as the default php version
cd wordpress
lando php -v | grep 7.2

# Should be running apache 2.4 by default
cd wordpress
lando ssh -s appserver -c "apachectl -V | grep 2.4"
lando ssh -s appserver -c "curl -IL localhost" | grep Server | grep 2.4

# Should be running mysql 5.7 by default
cd wordpress
lando mysql -V | grep 5.7

# Should not enable xdebug by default
cd wordpress
lando php -m | grep xdebug || echo $? | grep 1

# Should use the default database connection info
cd wordpress
lando mysql -uwordpress -pwordpress wordpress -e quit

# Should have the 2.x wp-cli
cd wordpress
lando wp cli version | grep "WP-CLI 2."

# Should create a wp-config file
cd wordpress/wordpress
lando wp config create --dbname=wordpress --dbuser=wordpress --dbpass=wordpress --dbhost=database --force

# Should be able to install wordpress
cd wordpress/wordpress
lando wp core install --url=lando-wordpress.lndo.site --title=LandoPress --admin_user=admin --admin_email=mike@pirog.com --skip-email
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd wordpress
lando destroy -y
lando poweroff
```
