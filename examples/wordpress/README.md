WordPress Composer Example
==========================

This example provides a Composer powered spin up of a WordPress site.

See the `.lando.yml` in this directory for WordPress configuration options.

ONE
-------

You should be able to run the following steps to get up and running with this example.

```bash
# Install dependencies with Composer
curl -L https://wordpress.org/latest.tar.gz | tar zxv --strip 1 -C web

# Start up the example
lando start
```

TWO
-------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get service (eg database) connection info
lando info

# Run WP-cli commands
lando wp --version
true
```

THREE
-------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Destroy the example
lando destroy -y
```

Bootup
------

Start the WordPress test app.

```bash
# Start WordPress
if [ -d "web" ]; then rm -Rf web; fi
lando start
lando composer install
cp config/wp-config.php web/wp-config.php
```

Testing
-------

Test the WordPress recipe.

```bash
# Test getting WordPress codebase via composer
lando composer install

# Verify we have a WordPress codebase
ls web |grep index.php

# Verify copy of wp-config.php file
cp config/wp-config.php web/wp-config.php

# Test installing WordPress via wp-cli
lando wp core install --path=web --url=wordpress.lndo.site --admin_user=root --admin_email=gff@gff.gov --title=WordPressLando

# Verify that we can access the homepage
lando ssh -c "curl nginx |grep \'Welcome to WordPress. This is your first post. Edit or delete it, then start writing!\'"
```

Cleanup
-------

Remove the test app.

```bash
# Remove the test WordPress app.
lando destroy -y
```
