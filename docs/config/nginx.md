---
description: Add a highly configurable nginx service to Lando for local development with all the power of Docker and Docker Compose. Learn how to change version, setup SSL, use a custom webroot or use custom Apache config.
---

# nginx

[nginx](https://www.nginx.com/resources/wiki/) is a very common web server and reverse proxy.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [1.18](https://hub.docker.com/r/bitnami/nginx)
*   **[1.17](https://hub.docker.com/r/bitnami/nginx)** **(default)**
*   [1.16](https://hub.docker.com/r/bitnami/nginx)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated (e.g. YMMV and do not expect a ton of support if you have an issue).

*   [1.14](https://hub.docker.com/r/bitnami/nginx)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: nginx:1.16.1
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/nginx) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: nginx:1.18
    webroot: .
    ssl: false
    config:
      server: SEE BELOW
      vhosts: SEE BELOW
      params: SEE BELOW
```

### Using custom nginx config files

You may need to override our [default nginx config](https://github.com/lando/cli/tree/main/plugins/lando-services/services/nginx) with your own custom [server](https://www.linode.com/docs/web-servers/nginx/how-to-configure-nginx/), [vhosts](https://www.linode.com/docs/web-servers/nginx/how-to-configure-nginx/) or [fastcgi_params](https://www.nginx.com/resources/wiki/start/topics/examples/full/) config.

If you do this, you must use files that exist inside your application and express them relative to your project root as shown below:

Note that the default files may change based on how you set `ssl`.

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory but you can call it whatever you want such as `.lando` in the example below:

```bash
./
|-- config
   |-- default.conf
   |-- nginx.conf
   |-- fastcgi_params
|-- index.html
|-- .lando.yml
```

**Landofile using custom nginx config**

```yaml
services:
  myservice:
    type: nginx
    config:
      server: config/nginx.conf
      vhosts: config/default.conf
      param: config/fastcgi_params
```

<RelatedGuides tag="nginx"/>
