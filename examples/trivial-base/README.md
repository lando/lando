Docker Compose Example
======================

This example uses Lando to load a Docker Compose file.

See the `.lando.yml` in this directory for Docker Compose configuration options.

Launch the app
--------------

Run the following steps to get up and running with this example.

```bash
# Start up the example
lando start
```

Validate it works as expected
-----------------------------

```bash
# Test 1
lando ssh web -c "true"
```

Blow it up
----------

```bash
# Destroy it
lando destroy -y
```
