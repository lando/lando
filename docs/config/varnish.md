---
description: Add a highly configurable varnish service to Lando for local development with all the power of Docker and Docker Compose.
---

# Varnish

[Varnish Cache](https://varnish-cache.org/intro/index.html#intro) is a web application accelerator also known as a caching HTTP reverse proxy. You install it in front of any server that speaks HTTP and configure it to cache the contents.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [6.0](https://hub.docker.com/r/wodby/varnish)
*   [6](https://hub.docker.com/r/wodby/varnish)
*   **[4.1](https://hub.docker.com/r/wodby/varnish)** **(default)**
*   [4](https://hub.docker.com/r/wodby/varnish)
*   [custom](./../config/services.md#advanced)

## Patch versions

This service does not support patch versions but if you **really** need something like that, you could consider using either a [custom compose service](./compose.md) or a service [overrides](./../config/services.md#overrides).

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: varnish:4.1
    backends:
      - appserver
    backend_port: 80
    ssl: false
    config:
      vcl: SEE BELOW
    overrides:
      environment: SEE BELOW
```

### Connecting to backend services

You will need to list the `http` backend services you want `varnish` to use. Note that the services in this list should be serving content on port `80`. They can be discovered by running [lando info](./../cli/info.md).

An example of a Landofile's `services` config that connects to a `nginx` backend called `web1` is shown below:

```yaml
services:
  myservice:
    type: varnish
    backends:
      - web1
  web1:
    type: nginx
```

### Setting a port

While we assume your `varnish` service is running on port `80`, we recognize that many apps also run on other ports. You can easily change our default to match whatever your app needs. Note that this port applies to **ALL BACKENDS**.

```yaml
services:
  myservice:
    type: varnish
    backend_port: 8080
```

### Using SSL

In order to access varnish over `https`, you only need to set `ssl: true`. However, because [varnish is not built to run over https](https://www.section.io/blog/varnish-cache-https/), we will spin up an additional `nginx` container called `SERVICE_ssl` and handle SSL termination there.

### Using a custom VCL file

It's highly likely you will want to use your own [vcl](https://varnish-cache.org/docs/trunk/users-guide/vcl.html) file to mimic the setup that you need to test against. You can do that by setting `config.vcl` as shown below:

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory but you can call it whatever you want such as `.lando` in the example below:

```bash
./
|-- config
   |-- custom.vcl
|-- .lando.yml
```

**Landofile's varnish config**

```yaml
services:
  myservice:
    type: varnish
    config:
      vcl: config/custom.vcl
```

### Advanced

There are also [several various envvars](https://github.com/wodby/varnish#environment-variables) exposed by the underlying image we use that you can set to further customize how your Varnish works. **These are not officially supported** so we *highly recommend* you do not alter them unless you know what you are doing. Even then, YMMV.

That said, you will need to use a [service override](./../config/services.md#overrides) to take advantage of them as shown below:

```yaml
myservice:
  type: varnish
  hosts:
    - database
  overrides:
    environment:
      VARNISH_STRIP_ALL_PARAMS: true
      VARNISHD_PARAM_FETCH_CHUNKSIZE:	16k
      VARNISHD_PARAM_FIRST_BYTE_TIMEOUT:	80
      VARNISHD_PARAM_GZIP_BUFFER:	32k
```

## Getting information

You can get connection and credential information about your varnish instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).
