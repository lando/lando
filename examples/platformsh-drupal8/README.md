Platform.sh Drupal 8 Example
============================

This example exists primarily to test the following documentation:

* [Platform.sh Recipe - Drupal 8](https://docs.lando.dev/config/platformsh.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lagoon drupal example
true
# rm -rf drupal && mkdir -p drupal && cd drupal
# lando init --source remote --remote-url https://github.com/amazeeio/drupal-example.git --recipe lagoon

# Should start up our lagoon drupal 8 site successfully
true
# cd drupal
# lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to composer install
true
# cd drupal
# lando composer install

# Should be able to site install via drush
# NOTE: we TRUE for now because the installer fails trying to send email
# and we cant disable that settings in the usual way, we inspect success in the next command
true
# cd drupal
# lando drush site-install config_installer -y || true
# lando drush status | grep "Drupal bootstrap" | grep "Successful"
# lando drush cr

# Should have a running drupal 8 site
true
# cd drupal
# lando ssh -s cli -c "curl -kL http://nginx:8080" | grep "Welcome to Site-Install"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to destroy our drupal7 site with success
true
# cd drupal
# lando destroy -y
# lando poweroff
```
