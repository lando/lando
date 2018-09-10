Solr Example
============

This example provides a NodeJS based SOLR example.

See the `.lando.yml` in this directory for SOLR configuration options.

Start me up
-----------

Run the following commands to get up and running with this example.

```bash
# Start up the solr
lando start
```

Validate things are good
------------------------

Run the following commands to confirm things

```bash
# Verify we have an admin page
lando ssh appserver -c "curl -I admin.solr.lndo.site | grep 200 | grep OK"

# Verify solr portforward
docker inspect solr_index_1 | grep HostPort | grep 9999
lando info | grep port | grep 9999

# Verify solr version
lando ssh index -c "solr version | grep 5.5."

# Verify that we have the correct core
lando ssh appserver -c "curl index:8983/solr/admin/cores | grep name | grep freedom"

# Verify we can connect to solr
lando ssh appserver -c "curl solr.lndo.site | grep status | grep OK"
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get solr connection info
lando info

# Verify we can connect to solr
curl solr.lndo.site

# Verify the solr admin site is available
curl admin.solr.lndo.site/solr/#
```

Destroy things
--------------

Run the following commands to clean up

```bash
# Destroy the solr
lando destroy -y
```
