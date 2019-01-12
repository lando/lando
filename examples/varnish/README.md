Varnish Example
===============

[Varnish Cache](https://varnish-cache.org/intro/index.html#intro) is a web application accelerator also known as a caching HTTP reverse proxy. You install it in front of any server that speaks HTTP and configure it to cache the contents. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[4.1](https://hub.docker.com/r/eeacms/varnish/)** **(default)**
*   custom

Using patch versions
--------------------

Because we use a custom third-party image for `varnish` specifying a patch version is not currently supported. If you need to use a patch version you might be able to use our [advanced service config](https://docs.devwithlando.io/config/advanced.html).

Example
-------


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/varnish).

This example provides a LEMP stack running behind Varnish.

See the `.lando.yml` in this directory for Varnish configuration options.

This is the dawning of the age of edgequarius
---------------------------------------------

Run the following commands to get up and running with this example.

```bash
# Start up varnish
lando start
```

Testing Criteria
----------------

Run the following commands to test things are as they should be

```bash
# Verify we have both a varnish edge and a ssl nginx termination
docker ps | grep varnish_edge_1
docker ps | grep varnish_edge_ssl_1

# Verify that varnish is actually on the edge
docker inspect varnish_edge_1 | grep HostRegexp:varnish.lndo.site

# Verify we have the right version of varnish
lando ssh appserver -c "curl -I varnish.lndo.site | grep Via | grep varnish-v4"

# Verify we are getting the right things from varnish
lando ssh appserver -c "curl -I varnish.lndo.site | grep 200 | grep OK"
lando ssh appserver -c "curl -I varnish.lndo.site | grep X-Varnish"

# Verify our custom config file is in the right place
lando ssh edge -c "cat /etc/varnish/conf.d/custom.vcl | grep WORKINGONSOMENIGHTMOVES"

# Verify the edge_ssl container is also serving things
lando ssh appserver -c "curl -Ik https://edge_ssl | grep 200 | grep OK"
lando ssh appserver -c "curl -Ik https://edge_ssl | grep X-Varnish"
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

Destruction, Total
------------------

Run the following commands to get up and running with this example.

```bash
# Destroy varnish
lando destroy -y
```
