Varnish
=======

[Varnish Cache](https://varnish-cache.org/intro/index.html#intro) is a web application accelerator also known as a caching HTTP reverse proxy. You install it in front of any server that speaks HTTP and configure it to cache the contents.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.yml).

<!-- toc -->

Supported versions
------------------

*   **[4.1](https://hub.docker.com/r/eeacms/varnish/)** **(default)**
*   [custom](./../config/services.md#advanced)

Patch versions
--------------

This service does not support patch versions but if you **really** need something like that you could consider using either a [custom compose service](./compose.md) or a service [overrides](./../config/services.md#overrides).

Configuration
-------------

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  my-service:
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

Here is an example of a Landofile's `services` config that connects to a `nginx` backend called `web1`.

```yaml
services:
  my-service:
    type: varnish
    backends:
      - web1
  web1:
    type: nginx
```

### Setting a port

While we assume your `varnish` service is running on port `80` we recognize that many apps also run on other ports. You can easily change our default to match whatever your app needs. Note that this port applies to **ALL BACKENDS**.

```yaml
services:
  my-service:
    type: varnish
    backend_port: 8080
```

### Using SSL

In order to access varnish over `https` you only need to set `ssl: true`. However, because [varnish is not built to run over https](https://www.section.io/blog/varnish-cache-https/) we will spin up an additional `nginx` container called `SERVICE_ssl` and handle SSL termination there.

### Using a custom VCL file

It's highly likely you will want to use your own [vcl](https://varnish-cache.org/docs/trunk/users-guide/vcl.html) file to mimic the setup that you need to test against. You can do that by setting `config.vcl` as in below:

**A hypothetical project**

```bash
./
|-- config
   |-- custom.vcl
|-- .lando.yml
```

**Landofile's varnish config**

```yaml
services:
  my-service:
    type: varnish
    config:
      vcl: config/custom.vcl
```

### Advanced

There are also [serveral various envvars](https://hub.docker.com/r/eeacms/varnish/) exposed by the underlying image we use that you can set to further customize how your Varnish works. **These are not officially supported** so we *highly recommend* you do not alter them unless you know what you are doing. Even then YMMV.

That said, you will need to use a [service override](./../config/services.md#overrides) to take advantage of them like so:

```yaml
my-service:
  type: varnish
  hosts:
    - database
  overrides:
    environment:
      BACKENDS_PROBE_ENABLED: false
      DNS_ENABLED: true
      BACKENDS_PROBE_INTERVAL: 3s
      BACKENDS_PROBE_TIMEOUT: 1s
      BACKENDS_PROBE_WINDOW: 3
      BACKENDS_PROBE_THRESHOLD: 2
```

Getting information
-------------------

You can get connection and credential information about your varnish instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

Example
-------

If you are interested in a working example of this service that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/varnish](https://github.com/lando/lando/tree/master/examples/varnish)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
