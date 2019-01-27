Drupal 6 Example
================

This example exists primarily to test the following documentation:

* [Drupal 6](https://docs.devwithlando.io/tutorial/drupal6.html)

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the latest D6 codebase
rm -rf drupal6
mkdir -p drupal6
cd drupal6
lando init --source remote --remote-url https://ftp.drupal.org/files/projects/drupal-6.38.tar.gz --remote-options="--strip-components 1" --recipe drupal6 --webroot . --name lando-drupal6

# Should start up succesfully
cd drupal6
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return something
cd drupal6
lando ssh -s appserver -c "curl -L localhost" | grep "Choose language"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
cd drupal6
lando destroy -y
lando poweroff
```
