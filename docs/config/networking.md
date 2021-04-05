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

## Port considerations

::: warning This behavior changed in `3.0.29`
To read about previous behavior check out the [older networking docs](https://github.com/lando/lando/blob/v3.0.28/docs/config/networking.md#port-considerations)
:::

Prior to Lando `3.0.29`, when trying to communicate between two services using `proxy` addresses a la `thing.lndo.site` you had to explicitly use the internal proxy port and protocol if they differed from the proxy.

Consider the below example for a clearer picture of this behavior.

```yaml
proxy:
  appserver:
    - my-project.lndo.site:8000
  another_thing:
    - thing.my-project.lndo.site
```

```bash
# Access the services externally (eg on your host) using the proxy
curl https://lamp2.lndo.site
curl thing.my-project.lndo.site

# Access the services internally (eg from inside a container) using the proxy alias
# Below will fail
lando ssh -s appserver -c "curl my-project.lndo.site"
# Below will succeed
lando ssh -s appserver -c "curl thing.my-project.lndo.site"
# Below will succeed
lando ssh -s appserver -c "curl my-project.lndo.site:8000"
```

As of Lando `3.0.29` internal requests to proxy addresses are now routed out to the proxy and back into Lando. This means that the behavior is now the same regardless of whether the request originates on your host or from inside a container.

However, please note that _**this could be a breaking change**_ if your app was hardcoding the needed port. In most of these cases you can now simply omit the port since the proxy will know what port to use for a given service.

Expressed in terms of the above example you should now expect this:

```yaml
proxy:
  appserver:
    - my-project.lndo.site:8000
  another_thing:
    - thing.my-project.lndo.site
```

```bash
# Access the services externally (eg on your host) using the proxy
curl https://lamp2.lndo.site
curl thing.my-project.lndo.site

# Access the services internally (eg from inside a container) using the proxy alias
# Below will succeed
lando ssh -s appserver -c "curl my-project.lndo.site"
# Below will succeed
lando ssh -s appserver -c "curl thing.my-project.lndo.site"
# Below will fail
lando ssh -s appserver -c "curl my-project.lndo.site:8000"
```

<RelatedGuides tag="Networking"/>
