Elasticsearch
=============

[Elasticsearch](https://www.elastic.co/products/elasticsearch) is a search and analytics engine, commonly used as a substitute for Solr or for collecting log and metrics data.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.yml).

<!-- toc -->

Supported versions
------------------

*   **[6](https://hub.docker.com/r/bitnami/elasticsearch)** **(default)**
*   [6.5.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [5](https://hub.docker.com/r/bitnami/elasticsearch)
*   [5.6.x](https://hub.docker.com/r/bitnami/elasticsearch)
*   [custom](./../config/services.md#advanced)

Patch versions
--------------

> #### Warning::Not officially supported!
>
> While we allow users to specify patch versions for this service they are not *officially* supported so if you use one YMMV.

To use a patch version you can do something like this:

```yaml
services:
  my-service:
    type: elasticsearch:5.6.14
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/elasticsearch/tags) for the underlying image we are using.

Configuration
-------------

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  my-service:
    type: elasticsearch:6
    portforward: false
    mem: 1025m
    plugins: []
    config:
      server: SEE BELOW
```

### Portforwarding

`portforward` will allow you to access this service externally by given you a port directly on your host's `localhost`. Note that `portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  my-service:
    type: elasticsearch
    portforward: true
```

**Not recommended**

```yaml
services:
  my-service:
    type: elasticsearch
    portforward: 9200
```

### Using a custom elasticsearch.yml

You may need to override our [elasticsearch config](https://github.com/lando/lando/tree/master/plugins/lando-services/services/elasticsearch) with your own [elasticsearch config file](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html#settings).

If you do this you must use a file that exists inside your applicaton and express it relative to your project root as below.

**A hypothetical project**

```bash
./
|-- config
   |-- elasticsearch.yml
|-- .lando.yml
```

**Landofile's elastic config**

```yaml
services:
  my-service:
    type: elasticsearch
    config:
      server: config/elasticsearch.yml
```

Getting information
-------------------

You can get connection and credential information about your elasticsearch instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

Example
-------

If you are interested in a working example of this service that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/elasticsearch](https://github.com/lando/lando/tree/master/examples/elasticsearch)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
