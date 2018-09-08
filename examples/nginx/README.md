nginx Example
=============

This example provides a very basic `nginx` web server.

See the `.lando.yml` in this directory for nginx configuration options.

Spin things up
--------------

Run the following commands to get up and running with this example.

```bash
# Start up a nginx server
lando start
```

Testing
-------

Run the following commands to validate things are rolling as they should.

```bash
# Test 1
lando ssh appserver -c "true"

# Test 2
lando ssh appserver -u root -c "cat /cert-log.txt"
```

Cleanup
-------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the nginx server and clean things up
lando destroy -y
```
