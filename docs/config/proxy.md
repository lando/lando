---
description: The Lando proxy layer allows you to specify HTTP or HTTPS (e.g. TLS/SSL routes to specific services in a few lines of config). You can also customize the domain and certificates used.
---

# Proxy

By default, Lando runs a [traefik](https://traefik.io/) reverse proxy when needed so that users' apps can route stable, predictable and "nice" URLS to various ports inside of various services.

While you can [configure](#configuration) the default `domain` of this proxy, we *highly recommend* you do not alter the default behavior unless you have a fairly compelling reason to do so. A compelling reason to *not* change them are that the default `lndo.site` domain works "out of the box" while custom domains require [additional setup](#working-offline-or-using-custom-domains).

Specifically, `*.lndo.site` is an actual *ON THE INTERNET* wildcard DNS entry that points all `*.lndo.site` subdomains to `localhost/127.0.0.1`. This means that if you lose your internet connection, you will not be able to visit your app at these addresses. However, you can [take steps](#working-offline-or-using-custom-domains) to work around this restriction or use your own [custom domain](#configuration) and handle the DNS yourself with `dnsmasq` or some other solution.

::: tip Proxying is not required
As long as your containers or services expose ports `80` and/or `443`, Lando will smartly allocate `localhost` addresses for them. Proxying is meant to augment how your app is accessed with additional domains.

You can also tell Lando to scan additional ports with the [moreHttpPorts](./services.md) key available in every service.
:::

There is also a [known issue](./../help/dns-rebind.md) called DNS rebinding protection which blocks this functionality.

[[toc]]

## Automatic Port Assignment

By default, Lando will attempt to bind the proxy to your host machine's port `80` and `443`. If it cannot bind to these addresses, which is usually the case if something else like a local `apache` service is running, it will fallback to other commonly used ports such as `8888` and `444`. The default and fallback ports Lando uses are all [configurable](#configuration).

::: warning Will bind to 127.0.0.1 by default
For security reasons, Lando will force bind your ports to `127.0.0.1` unless you have either explicitly set the Lando [global config](./global.md) option `bindAddress` to something else **OR** you have overridden a service and set the bind.

For more information, check out the [security docs.](./security.md)
:::

If you want to use port `80` and `443` but cannot for the life of you figure out what is already using them, you can do a bit of discovery using `lsof` or by visiting `localhost` in your browser and seeing if you recognize what loads.

```bash
# Find out if any service listens on those ports.
sudo lsof -n -i :80 | grep LISTEN
sudo lsof -n -i :443 | grep LISTEN

# If any services are listed, you can try killing them or stopping them a different way.
sudo kill -9 $PID
```

## Usage

You can add routing to various services and their ports using the top-level `proxy` config in your [Landofile](./lando.md).

Because our proxy also benefits from our [automatic certificate and CA setup](./security.md), if you have a service with `ssl: true` then it will also be available over `https`. Note that many of our recipes will configure this for you automatically. There are also some caveats to this that you can read more about [below](#using-https).

### Routing to port 80

Note that `web` and `web2` are the names of some of your [services](./services.md). If you are unsure about the names of your services, run `lando info`.

```yaml
proxy:
  web:
    - myapp.lndo.site
  web2:
    - admin-myapp.lndo.site
```

### Routing to a different port

You can suffix the domain with `:PORT` to change the default `port` from `80` to `PORT`. Note that this is the port that your service exposes from within Lando and not an external port. In the below example, this means that `appserver` exposes port `8888` and we want `myapp.lndo.site` to route our request into Lando at `appserver:8888`.

```yaml
proxy:
  appserver:
    - myapp.lndo.site:8888
```

### Using a non `lndo.site` domain

You can actually use *any* domain in your proxy settings but you will be responsible for their DNS resolution. See the configuration section below for more details.

::: tip
If your custom domain does not end in `lndo.site` and you are unsure about how to handle DNS resolution, use something like DNSMasq. Then you need to add the domain to your `hosts` file so that it points to `127.0.0.1`.
::::

```yaml
proxy:
  web:
    - mysite.lndo.site
    - sub.mysite.lndo.site
    - bob.frank.kbox.com
    - tippecanoe.tyler.too
```

### Wildcard domains

If a service is able to listen to multiple domain names following a common pattern, you can use the `*` wildcard character to match any amount of alphanumeric characters and hyphens/dashes (`-`).

To match `site1.myapp.lndo.site` and `site2.myapp.lndo.site`, you can, for example, use `*.myapp.lndo.site` or `*.*.lndo.site`.

::: tip Wildcard domains need to be encapsulated in quotations
If you are using a wildcard domain, you will need to write it as `"*.myapp.lndo.site"` and not `*.myapp.lndo.site` due to the way `yaml` parses files. If you do not do this, you should expect a `yaml` parse error.
:::

```yaml
proxy:
  web2:
    - another.lndo.site
    - "*.mysite.lndo.site"
    - "orthis.*.lndo.site"
```

Note that only single left-most wildcards eg `*.my.other.domain` will benefit from our automatic SSL cert generation. This is a restriction imposed on us directly by the [SAN rules](https://security.stackexchange.com/questions/158332/what-are-wildcard-certificate-limitations-in-san-extension).

### Subdirectories

You can also have a specific path on a domain route to a service.

```yaml
proxy:
  appserver:
    - name.lndo.site
  api:
    - name.lndo.site/api
  admin:
    - name.lndo.site/admin/portal
```

### Sub subdomains

You can also `sub.sub...sub.sub.domain.tld` to your heart's content.

```yaml
proxy:
  web2:
    - admin.mysite.lndo.site
    - better.admin.mysite.lndo.site
    - mailhog.mysite.lndo.site
    - omg.how.log.can.you.go.pma.mysite.lndo.site
```

### Combos

You can also combine the settings above into a single, real nasty looking, but still valid config.

```yaml
proxy:
  appserver:
    - "*.lndo.site:8080/everything/for-real"
```

This is still a valid proxy config!

### Using https

The below assumes that you've read the [Security Documentation](./security.md) and whitelisted our CA. **If you have not done this then you will need to manually handle any browser warnings you get.**

If Lando detects that a service has a cert available it will automatically configure an additional `https` proxy route for each. You can, however, manually trigger this by configuring the `ssl` and `sslExpose` options on each service.

```yaml
services:
  web:
    ssl: true
    sslExpose: true
```

The `ssl: true` choice implies `sslExpose: true` unless you explicitly set `sslExpose: false`.

The former will tell the service to attempt to generate a certificate.

The latter will expose the secure port (usually 443) for the service and assign a `localhost:someport` address to the service. This means that if your service does not actually plan to serve https by itself you may experience a hang as Lando tries to health scan a `localhost` https address that doesn't actually serve https. In these scenarios its best to tell Lando you just want a cert.

**just generate a cert**

```yaml
services:
  web:
    ssl: true
    sslExpose: false
```

In some rare scenarios a service does not boot up as `root`. This is especially true for the `compose` service. In these situations Lando will be unable to generate a cert and will fall back to the global wildcard certificate for the `proxyDomain` which is `*.lndo.site` by default.

This means that subdomains like `sub.mysite.lndo.site` will likely produce a browser warning. However, domains like `sub-mysite.lndo.site` will continue to work since they are covered by the global wildcard cert.

### Advanced

For advanced usage like setting custom headers and redirects you can access traefik's [middleware layer](https://docs.traefik.io/middlewares/overview/) using the following config:

```yaml
proxy:
  appserver:
    - hostname: object-format.lndo.site
      port: 80
      pathname: /
      middlewares:
        - name: test
          key: headers.customrequestheaders.X-Lando-Test
          value: on
        - name: test-secured
          key: headers.customrequestheaders.X-Lando-Test-SSL
          value: on
```

Note that while `name` is arbitrary if it ends in `-secured` it will _only_ be applied to `https` routes. Please consult the [traefik documentation](https://docs.traefik.io/middlewares/overview/) for the exact Docker label based syntax.

## Configuration

Various parts of the proxy are configurable via the Lando [global config](./global.md).

**Again, you REALLY, REALLY, REALLY should not change these settings unless you have a good reason and know what you are doing!**

The defaults and what they are good for is shown below:

```yml
# Set to anything else to disable
proxy: "ON"
# Set to rename the proxy container
proxyName: "landoproxyhyperion5000gandalfedition"
# Configure the ports and fallbacks
proxyHttpPort: 80
proxyHttpsPort: 443
proxyHttpFallbacks:
  - 8000
  - 8080
  - 8888
  - 8008
proxyHttpsFallbacks:
  - 444
  - 4433
  - 4444
  - 4443
# Specify different fallback default certs
# NOTE: these paths are path INSIDE the proxy container
proxyDefaultCert: '/certs/cert.crt'
proxyDefaultKey: '/certs/cert.key'

# This is an advanced option but allows you to alter the proxy container boot up
# configuration
proxyCommand:
  - "/entrypoint.sh"
  - "--log.level=DEBUG"
  - "--api.insecure=true"
  - "--api.dashboard=false"
  - "--providers.docker=true"
  - "--entrypoints.https.address=:443"
  - "--entrypoints.http.address=:80"
  - "--providers.docker.exposedbydefault=false"
  - "--providers.file.directory=/lando/proxy/config"
  - "--providers.file.watch=true"
# This is an object you can use to configure dynamic traefik 2 config
# NOTE: that it must be in YAML format
proxyCustom: {}
# Disable this and traefik will not try to use the certs generated by services
# This is useful in combination with proxyCustom so you can use your own certs
proxyPassThru: true

# For security reasons we bind the proxy to 127.0.0.1
# If unset this will default to the `bindAddress` value
proxyBindAddress: "127.0.0.1"
# Legacy, use the "domain" setting below instead
proxyDomain: lndo.site

# Editing the domain will also generate a new Lando CA
# See the Security docs for more info on that
domain: lndo.site
```

You will need to do a `lando poweroff` to apply these changes.

Note that we generate a [Certificate Authority](./security.md) based on the `domain` and use this CA to sign wildcard certs for each service. This means that we are inherently bound to [certain restrictions](https://en.wikipedia.org/wiki/Wildcard_certificate#Limitations) governing wildcard certificates. For example, if you set `domain` to a top level domain such as `test`, you should not expect our wildcard certs to work correctly. It is recommended you use a first level subdomain such as `me.test` or `local.test`.

## Working Offline or Using Custom Domains

If you are working offline and/or have added custom domains and want to get them to work, you will need to edit your `hosts` file. Generally, this file is located at `/etc/hosts` on Linux and macOS and `C:\Windows\System32\Drivers\etc\host` on Windows. You will need administrative privileges to edit this file.

Here is a [good read](http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/) if you are not very familiar with the `hosts` file, how to edit it and how it works.

An example is shown below:

```bash
# Get my `lndo.site` domain to work offline
127.0.0.1 myapp.lndo.site

# Get my custom domain to work
127.0.0.1 billy.dee.williams
```

For a more comprehensive doc on this, please check out our [Working Offline Guide](./../guides/offline-dev.md).

<RelatedGuides tag="Proxy"/>
