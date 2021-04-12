---
description: Add a highly configurable Elasticsearch service to Lando for local development with all the power of Docker and Docker Compose.
---

# Elasticsearch

[Elasticsearch](https://www.elastic.co/products/elasticsearch) is a search and analytics engine, commonly used as a substitute for Solr or for collecting log and metrics data.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [7](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.12.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.11.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.10.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.9.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.8.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.7.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.6.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.5.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.4.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [7.3.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   **[6](https://hub.docker.com/r/bitnami/elasticsearch)** **(default)**
*   [6.8.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [6.7.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [6.6.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [6.5.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [5](https://hub.docker.com/r/bitnami/elasticsearch)
*   [custom](./../config/services.md#advanced)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: elasticsearch:5.6.15
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/elasticsearch/tags) for the underlying image we are using.

## Other requirements

Elasticsearch requires you set the kernel property `vm.max_map_count` to at least `262144` in order to run correctly. Lando will attempt to set this on install if you use any of our official package installers for Windows, macOS, Debian, RPM or Pacman.

However, if you are installing from source or via another pathway you will need to set this manually. Generally this can be accomplished with the following:

```bash
sysctl -w vm.max_map_count=262144
```

But we recommend you check out the following issue for more information:
<https://github.com/lando/lando/issues/1967>

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: elasticsearch:6
    portforward: false
    mem: 1025m
    plugins: []
    config:
      server: SEE BELOW
```

### Port forwarding

`portforward` will allow you to access this service externally by assigning a port directly on your host's `localhost`. Note that `portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  myservice:
    type: elasticsearch
    portforward: true
```

**Not recommended**

```yaml
services:
  myservice:
    type: elasticsearch
    portforward: 9200
```

### Using a custom elasticsearch.yml

You may need to override the default config with your own [elasticsearch config file](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html#settings). Note that [according to the underlying upstream image](https://github.com/bitnami/bitnami-docker-elasticsearch#configuration-file) this will _completely_ replace the default config. Further note that by default our elasticsearch services start as `data` nodes. If you want to activate your node to also be an `ingest` node then check out [this example](https://github.com/lando/lando/tree/master/examples/elasticsearch).

If you do this, you must use a file that exists inside your application and express it relative to your project root as shown below:

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory in the below example but you can call it whatever you want such as `.lando`.

```bash
./
|-- config
   |-- elasticsearch.yml
|-- .lando.yml
```

**Landofile's elastic config**

```yaml
services:
  myservice:
    type: elasticsearch
    config:
      server: config/elasticsearch.yml
```

## Getting information

You can get connection and credential information about your elasticsearch instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

<RelatedGuides tag="Elasticsearch"/>

## Adding Kibana for Elasticsearch

If you want to add a Kibana service for your Elasticsearch, you can easily use a [custom compose service](./compose.md).
The version of Kibana should match your version of Elasticsearch!

```yaml
services:
  kibana:
    type: compose
    services:
      image: bitnami/kibana:7.12.0
      command: '/opt/bitnami/scripts/kibana/entrypoint.sh /opt/bitnami/scripts/kibana/run.sh'
```
