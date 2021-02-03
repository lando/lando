---
description: Add a highly configurable redis service to Lando for local development with all the power of Docker and Docker Compose.
---

# Redis

[Redis](https://redis.io/) is an open source, in-memory and typed data structure store, used as a database, cache and message broker.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [6](https://hub.docker.com/_/redis)
*   [6.0](https://hub.docker.com/_/redis)
*   **[5](https://hub.docker.com/_/redis)** **(default)**
*   [5.0](https://hub.docker.com/_/redis)
*   [4](https://hub.docker.com/_/redis)
*   [4.0](https://hub.docker.com/_/redis)
*   [2.8](https://hub.docker.com/_/redis)
*   [custom](./../config/services.md#advanced)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: redis:4.0.12
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/library/redis/tags/) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  myservice:
    type: redis:5
    persist: false
    portforward: false
    config:
      server: SEE BELOW
```

### Persisting data

This option is pretty straightforward. Use `persist: true` to persist the cache's data between restarts and rebuilds.

### Port forwarding

`portforward` will allow you to access this service externally by assigning a port directly on your host's `localhost`. Note that `portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  myservice:
    type: redis
    portforward: true
```

**Not recommended**

```yaml
services:
  myservice:
    type: redis
    portforward: 6379
```

### Using a custom redis.conf

You may need to override our [default redis server config](https://github.com/lando/lando/tree/master/plugins/lando-services/services/redis) with your own [custom redis config file](https://redis.io/topics/config).

If you do this, you must use a file that exists inside your application and express it relative to your project root as shown below:

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory in the below example but you can call it whatever you want such as `.lando`.

```bash
./
|-- config
   |-- redis.conf
|-- .lando.yml
```

**Landofile's redis config**

```yaml
services:
  myservice:
    type: redis
    config:
      server: config/redis.conf
```

## Getting information

You can get connection and credential information about your redis instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

<RelatedGuides tag="Redis"/>
