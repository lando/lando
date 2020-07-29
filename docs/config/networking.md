---
description: Lando improves the core networking provided by Docker and Docker Compose so it is more useful in the local development context and lets containers talk to each other even across applications.
---

# Networking

Lando sets up and manages its own internal Docker network. This provides a common pattern, predictable hostnames and a more reliable experience for local development networking, generally.

Specifically, every Lando service, even those added via the `compose` top level config, should be able to communicate with every other service regardless of whether that service is part of your app or not.  Also note that because of our [automatic certificate and CA setup](./security.md), you should be able to access all of these services over `https` without needing, for example the `-k` option in `curl`.

::: warning Cross app service communication requires all apps to be running!
If you want a service in App A to talk to a service in App B then you need to make sure you've started up both apps!
:::

[[toc]]

## Automatic Hostnames

By default, every service will get and be accessible at a hostname of the form `<service>.<app>.internal`. For example, if you have an app called `labouche` and a service called `redis`, it should be accessible from any other container using `redis.labouche.internal`.

Lando will also look at your services [proxy](./proxy.md) settings and alias those addresses to the correct service. This means that you should also be able to access services across apps using any of their proxy hostnames.

You can get information about which hostnames and urls map to what services using `lando info`.

**Note that this automatic networking only happens INSIDE of the Docker daemon and not on your host.**

## Testing

You can verify that networking is set up correctly by spinning up two `lamp` recipes called `lamp1` and `lamp2` and running a few `curl` commands.

```bash
# Verify Lamp1's appserver can access Lamp2's appserver using the proxy and .internal addresses
cd /path/to/lamp1
lando ssh -s appserver -c "curl https://lamp2.lndo.site"
lando ssh -s appserver -c "curl https://appserver.lamp2.internal"

# And the reverse
cd /path/to/lamp2
lando ssh -s appserver -c "curl https://lamp1.lndo.site"
lando ssh -s appserver -c "curl https://appserver.lamp1.internal"

# You should even by able to connect to a database in a different app
cd /path/to/lamp2
lando ssh -s database -c "mysql -uroot -h database.lamp1.internal"
```

<RelatedGuides tag="Networking"/>
