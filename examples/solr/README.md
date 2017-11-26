Solr Example
============

This example provides a NodeJS based SOLR example.

See the `.lando.yml` in this directory for SOLR configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Install our node dependencies
lando npm install

# Start up the example
lando start

# Check out other commands you can use with this example
lando
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
