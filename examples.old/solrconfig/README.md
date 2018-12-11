Solr Config Example
===================

This example provides a `solr` instance with custom config. It is only meant to demonstrate adding custom `solr` config a la [#511](https://github.com/lando/lando/issues/551). This means you should only expect to get a URL to the `solr` admin so you can verify config as needed.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
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

# Verify we can connect to solr admin page
curl solrconfig.lndo.site
```
