---
description: Add a highly configurable memcached service to Lando for local development with all the power of Docker and Docker Compose.
---

# Memcached

[Memcached](https://memcached.org/) is an in-memory key-value store for small chunks of arbitrary data (strings, objects) from results of database calls, API calls, or page rendering.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   **[1](https://hub.docker.com/r/bitnami/memcached)** **(default)**
*   [1.5.12](https://hub.docker.com/r/bitnami/memcached)
*   [1.5.x](https://hub.docker.com/r/bitnami/memcached)
*   [custom](./../config/services.md#advanced)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service they are not *officially* supported so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: memcached:1.5.11
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/memcached/tags) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: memcached:1
    portforward: false
    mem: 64
```

### Port forwarding

`portforward` will allow you to access this service externally by assigning a port directly on your host's `localhost`. Note that `portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  myservice:
    type: memcached
    portforward: true
```

**Not recommended**

```yaml
services:
  myservice:
    type: memcached
    portforward: 11211
```

## Getting information

You can get connection and credential information about your memcached instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

<RelatedGuides tag="Memcached"/>
