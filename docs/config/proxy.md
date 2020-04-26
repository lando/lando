---
description: The Lando proxy layer allows you to specify HTTP or HTTPS (e.g. TLS/SSL routes to specific services in a few lines of config). You can also customize the domain and certificates used.
---

# Proxy

By default, Lando runs a [traefik](https://traefik.io/) reverse proxy when needed so that users' apps can route stable, predictable and "nice" URLS to various ports inside of various services.

While you can [configure](#configuration) the default `domain` of this proxy, we *highly recommend* you do not alter the default behavior unless you have a fairly compelling reason to do so. A compelling reason to *not* change them are that the default `lndo.site` domain works "out of the box" while custom domains require [additional setup](#working-offline-or-using-custom-domains).

Specifically, `*.lndo.site` is an actual *ON THE INTERNET* wildcard DNS entry that points all `*.lndo.site` subdomains to `localhost/127.0.0.1`. This means that if you lose your internet connection, you will not be able to visit your app at these addresses. However, you can [take steps](#working-offline-or-using-custom-domains) to work around this restriction or use your own [custom domain](#configuration) and handle the DNS yourself with `dnsmasq` or some other solution.

::: tip Proxying is not required
As long as your containers or services expose ports `80` and/or `443`, Lando will smartly allocate `localhost` addresses for them. Proxying is meant to augment how your app is accessed with additional domains.
:::

There is also a [known issue](./../help/dns-rebind.md) called DNS rebinding protection which blocks this functionality.

## Automatic Port Assignment

By default, Lando will attempt to bind the proxy to your host machines port `80` and `443`. If it cannot bind to these addresses, which is usually the case if something else like a local `apache` service is running it will fallback to other commonly used ports such as `8888` and `444`. The default and fallback ports Lando uses are all [configurable](#configuration).

If you want to use port `80` and `443` but cannot for the life of you figure out what is already using them you can do a bit of discovery using `lsof` or by visiting `localhost` in your browser and seeing if you recognize what loads.

```bash
# Find out if any service listens on those ports.
sudo lsof -n -i :80 | grep LISTEN
sudo lsof -n -i :443 | grep LISTEN

# If any services are listed, you can try killing them or stopping them a different way.
sudo kill -9 $PID
```

## Usage

You can add routing to various services and their ports using the top-level `proxy` config in your [Landofile](./lando.md). Because our proxy also benefits from our [automatic certificate and CA setup](./security.md) all proxy entries will automatically be available over both `http` and `https`.

### Routing to port 80

Note that `web` and `web2` are the names of some of your [services](./services.md). If you are unsure about the names of your services run `lando info`.

```yaml
proxy:
  web:
    - myapp.lndo.site
  web2:
    - admin-myapp.lndo.site
```

### Routing to a different port

You can suffix the domain with `:PORT` to change the default `port` from `80` to `PORT`. Note that this is the port that your service exposes from within Lando and not an external port. In the below example this means that `appserver` exposes port `8888` and we want `myapp.lndo.site` to route our request into Lando at `appserver:8888`.

```yaml
proxy:
  appserver:
    - myapp.lndo.site:8888
```

### Using a non `lndo.site` domain

You can actually use *any* domain in your proxy settings but you will be responsible for their DNS resolution and any relevant cert handling. See the configuration section below for more details.

::: tip
If your custom domain does not end in `lndo.site` and you unsure about how to handle DNS resolution using something like DNSMasq then you are going to need to add it to your `hosts` file so that it points to `127.0.0.1`.
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

If a service is able to listen to multiple domain names following a common pattern you can use the `*` wildcard character to match any amount of alphanumeric characters and hyphens/dashes (`-`).

To match `site1.myapp.lndo.site` and `site2.myapp.lndo.site` you can for example use `*.myapp.lndo.site` or `*.*.lndo.site`.

::: tip Wildcard domains need to be encapsulated in quotations
If you are using a wildcard domain you will need to write it as `"*.myapp.lndo.site"` and not `*.myapp.lndo.site` due to the way `yaml` parses files. If you do not do this you should expect a `yaml` parse error.
:::

```yaml
proxy:
  web2:
    - another.lndo.site
    - "*.mysite.lndo.site"
    - "orthis.*.lndo.site"
```

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

While you can sub-sub-...-sub-subdomain to your hearts content we recommend you do not because the Lando CA only handles first level subdomains by default. This will cause sub-subdomains or deeper to produce browser warnings **even if you have [trusted our CA](./security.md#trusting-the-ca)**. We recommend you instead use hyphenated "subdomains".

**Works but not recommended**

```yaml
proxy:
  web2:
    - admin.mysite.lndo.site
    - better.admin.mysite.lndo.site
    - mailhog.mysite.lndo.site
    - pma.mysite.lndo.site
```

**Works AND recommended!**

```yaml
proxy:
  web2:
    - admin-mysite.lndo.site
    - better-admin-mysite.lndo.site
    - mailhog-mysite.lndo.site
    - pma-mysite.lndo.site
```

You can read more about this restriction [here](https://stackoverflow.com/questions/26744696/ssl-multilevel-subdomain-wildcard).

### Combos

You can also combine the settings above into a single, real nasty looking, but still valid config.

```yaml
proxy:
  appserver:
    - "*.lndo.site:8080/everything/for-real"
```

This is still valid proxy config!

## Configuration

Various parts of the proxy are configurable via the Lando [global config](./global.md).

**Again, you REALLY REALLY REALLY should not change these settings unless you have a good reason and know what you are doing!**

```yml
# Set to anything else to disable
proxy: ON
# For security reasons we bind the proxy to localhost
# If unset this will default to the `bindAddress` value
proxyBindAddress: "127.0.0.1"
# Legacy, use the "domain" setting below instead
proxyDomain: lndo.site
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
# Editing the domain will also generate a new Lando CA
# See the Security docs for more info on that
domain: lndo.site
```

You will need to do a `lando poweroff` to apply these changes.

Note that we generate a [Certificate Authority](./security.md) based on the `domain` and use this CA to sign wildcard certs for each service. This means that we are inherently bound to [certain restrictions](https://en.wikipedia.org/wiki/Wildcard_certificate#Limitations) governing wildcard certificates. For example, if you set `domain` to a top level domain such as `test` you should not expect our wildcard certs to work correctly. It is recommended you use a first level subdomain such as `me.test` or `local.test`.

## Working Offline or Using Custom Domains

If you are working offline and/or have added custom domains and want to get them to work, you will need to edit your `hosts` file. Generally, this file is located at `/etc/hosts` on Linux and macOS and `C:\Windows\System32\Drivers\etc\host` on Windows. You will need administrative privileges to edit this file.

Here is a [good read](http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/) if you are not very familiar with the `hosts` file, how to edit it and how it works.

Here is an example:

```bash
# Get my `lndo.site` domain to work offline
127.0.0.1 myapp.lndo.site

# Get my custom domain to work
127.0.0.1 billy.dee.williams
```

For a more comprehensive doc on this please check out our [Working Offline Guide](./../guides/offline-dev.md).

<RelatedGuides tag="Proxy"/>
