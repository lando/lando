Elasticsearch Bug Replication
=============================

This example exists primarily to verify an Elastic 6.5.x bug

Start up tests
--------------

Run the following commands to get up and running
with this example.

```bash
# Should start up successfully
lando destroy -y
lando start
```

Verification commands
---------------------

Run the following commands to verify the bug.

```bash
# Should poweroff
lando poweroff

# Should not start with success after first `lando start`
lando start | grep "Service search is unhealthy"

# Should have error in search log after second `lando start`
lando logs -s search | grep "ERROR No Log4j"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
```
