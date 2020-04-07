Lagoon Drupal 8 Example
=======================

This example exists primarily to test the following documentation:

* [Lagoon Recipe - Drupal 7](https://docs.lando.dev/config/lagoon.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lando pantheon test drupal7 site
rm -rf drupal && mkdir -p drupal && cd drupal
lando init --source remote --remote-url https://github.com/amazeeio/drupal-example.git --recipe lagoon

# Should start up our drupal7 site successfully
cd drupal7
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be true
cd drupal
true
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to destroy our drupal7 site with success
cd drupal
lando destroy -y
lando poweroff
```
