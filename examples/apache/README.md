Apache Example
==============

This example provides a very basic `apache` web server.

See the `.lando.yml` in this directory for Apache configuration options.

Bootup
--------

Run the following commands to get up and running with this example.

```bash
# Start up the example
lando start
```

Testing
-------

Run the following commands to validate things are rolling as they should.

```bash
# Test 1
lando ssh appserver -c "true"
```

Cleanup
-------

Run the following commands to trash this app like nothing ever happened.

```bash
# Destroy the example
lando destroy -y
```
