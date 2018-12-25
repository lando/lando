Laravel Recipe Example
======================

This example provides a very basic `laravel` recipe example.

See the `.lando.yml` in this directory for Laravel configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Spin up a new laravel site
lando laravel new web

# Start up the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run artisan commands
cd web
lando artisan

# Run laravel commands
lando laravel
```

Bootup
------

Start the Laravel recipe.

```bash
# Start the app
if [ -d "web" ]; then rm -Rf web; fi
lando start
```

Testing
-------

Test the Laravel recipe.

```bash
# Test spinning up a new Laravel app
lando laravel new web

# Test we can use artisan tooling
lando ssh -c "cd web && php artisan"

# Verify we can visit the homepage
lando ssh -c "curl nginx |grep Laravel"
```

Cleanup
-------

Remove the test app.

```bash
# Remove the test laravel app.
lando destroy -y
```
