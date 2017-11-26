Proxy Format Example
====================

This example uses an `apache` and `nginx` webserver to demonstrate the proxy routing format.

See the `.lando.yml` in this directory for proxy configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

```bash
# Start up the example
# This may take awhile unless you've first added
#
#   - bob.frank.kbox.com
#   - frank.bob.joe
#   - tippecanoe.tyler.too
#
# To your `/etc/hosts`
# See: https://docs.devwithlando.io/config/proxy.html#working-offline-or-using-custom-domains
#
# If you have not added these entries then you should expect to see them as "red"
# after you start this example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Curl the default proxy URLs
curl http://trivial-proxy.lndo.site
# -k is needed to ignore the self-signed cert warning
curl -k https://trivial-proxy.lndo.site

# Curl some subdomains
curl http://sub.trivial-proxy.lndo.site

# Curl custom domains
# These should fail unless you've added the domains to your /etc/hosts file
# See: https://docs.devwithlando.io/config/proxy.html#working-offline-or-using-custom-domains
curl http://tippecanoe.tyler.too
```
