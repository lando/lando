Tests for Lando Share Command
=============================

This example provides tests for the `lando share` command.

Getting Started
---------------

This example is here for functional testing only.

Helpful Commands
----------------

```bash
# Get app info
lando info

# Verify the lando share command works
lando share --url http://localhost:8081
lando ssh -c "curl -I https://share.localtunnel.me |grep \'200 OK\'"
```

Bootup
------

Start up the share app for testing.

```bash
# Start the app
lando start
```

Testing
-------

Run these commands to make sure things are right as rain.

```bash
# Verify the lando share command works
lando share --url http://localhost:8081
lando ssh -c "curl -I https://share.localtunnel.me |grep \'200 OK\'"
```

Cleanup
-------

Run these commands to ensure we clean things up.

```bash
# Destroy the share app
lando destroy -y
```
