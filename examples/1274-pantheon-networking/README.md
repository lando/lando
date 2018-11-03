Issue 1274
==========

This is a test to replicate [#1274](https://github.com/lando/lando/issues/1274)

Start me up!
------------

```bash
# Start up an example using a basic Pantheon recipe
lando start
```

Verify things are in order
--------------------------

Run these commands to make sure Pantheon recipe services can talk to each other.

```bash
# Verify inter-service networking
lando talk_to_appserver
```

Destroy the app
---------------

Run these commands to ensure we clean things up.

```bash
# Destroys our custom app
lando destroy -y
```
