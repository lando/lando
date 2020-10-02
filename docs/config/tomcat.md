---
description: Add a highly configurable Apache Tomcat service to Lando for local development with all the power of Docker and Docker Compose.
---

# Tomcat

[Tomcat](https://tomcat.apache.org) The Apache Tomcat® software is an open source implementation of the Java Servlet, JavaServer Pages, Java Expression Language and Java WebSocket technologies.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [9](https://hub.docker.com/_/tomcat/)
*   [9.0](https://hub.docker.com/_/tomcat/)
*   **[8](https://hub.docker.com/_/tomcat/)** **(default)**
*   [8.5](https://hub.docker.com/_/tomcat/)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated (e.g. YMMV and do not expect a ton of support if you have an issue).

*   [7](https://hub.docker.com/_/tomcat/)
*   [7.0](https://hub.docker.com/_/tomcat/)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: tomcat:7.0.91
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/library/tomcat/tags/) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: tomcat:8
    webroot: .
    ssl: false
    config:
      server: SEE BELOW
      web: SEE BELOW
      context: SEE BELOW
      users: SEE BELOW
```

### Using custom Tomcat config files

You may need to override our [default tomcat config](https://github.com/lando/lando/tree/master/plugins/lando-services/services/tomcat) with your own.

If you do this, you must use files that exist inside your application and express them relative to your project root as shown below:

Note that the default files may change based on how you set `ssl`.

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory but you can call it whatever you want such as `.lando` in the example below:

```bash
./
|-- config
   |-- server.xml
   |-- web.xml
   |-- context.xml
   |-- tomcat-users.xml
|-- index.html
|-- .lando.yml
```

**Landofile using custom tomcat config**

```yaml
services:
  myservice:
    type: tomcat
    config:
      server: config/server.xml
      web: config/web.xml
      context: config/context.xml
      users: config/tomcat-users.xml
```
