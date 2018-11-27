Pantheon Example
================

See: https://docs.devwithlando.io/tutorials/pantheon.html

Spin things up
--------------

Run the following commands to get up and running with this example.

```bash
# Initialize a pantheon app
rm -rf web || true
mkdir web
lando init pantheon --pantheon-auth=$PANTHEON_MACHINE_TOKEN --pantheon-site=drupal-7-pantheon-basicz --dest=web -y

# Start up a pantheon app
cd web && lando start
```

Testing
-------

Run the following commands to validate things are rolling as they should.

```bash
# Run a lando pull
cd web && lando pull --code=dev --database=dev --files=dev

# Check terminus is installed
cd web && lando terminus --version
```

Cleanup
-------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the pantheon server and clean things up
cd web && lando destroy -y
```
