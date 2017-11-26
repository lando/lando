Varnish Example
===============

This example provides a LEMP stack running behind Varnish.

See the `.lando.yml` in this directory for Varnish configuration options.

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
# Verify the varnish service is running
docker ps | grep varnish_edge

# Curl the edge service and check for the Via: 1.1 varnish-vx header
curl -H http://edge.lndo.site

# Interact with varnish
lando varnishadm
lando varnishlog
lando varnishstat
```
