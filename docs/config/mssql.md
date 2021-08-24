---
description: Add a highly configurable Microsoft MSSQL service to Lando for local development with all the power of Docker and Docker Compose.
---

# MSSQL

[MSSQL](https://www.microsoft.com/en-us/sql-server/sql-server-2016) lets you build intelligent, mission-critical applications using a scalable, hybrid database platform that has everything built-in from in-memory performance and advanced security to in-database analytics.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [2019-latest](https://hub.docker.com/_/microsoft-mssql-server)
*   **[2017-latest](https://hub.docker.com/_/microsoft-mssql-server)** **(default)**
*   [custom](./../config/services.md#advanced)

## Patch versions

This service does not support patch versions but if you **really** need something like that, you could consider using either a [custom compose service](./compose.md) or a service [overrides](./../config/services.md#overrides).

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

::: warning Be careful when switching database type, version or credentials!
You should be careful switching database `type`, `version` or `creds`.

In the case of type and version, the underlying database files between these things will likely not be compatible. In the case of credentials, these are set when the container is **initially created** so in order to change them you need to `lando destroy && lando start`. Note that `lando destroy` will delete all the data in your database.


**Ignoring this warning can prevent your database from starting**
:::

```yaml
services:
  myservice:
    type: mssql
    portforward: false
    creds:
      password: he11oTHERE
```

### Port forwarding

`portforward` will allow you to access this service externally by assigning a port directly on your host's `localhost`. Note that ` portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  myservice:
    type: mssql
    portforward: true
```

**Not recommended**

```yaml
services:
  myservice:
    type: mssql
    portforward: 1433
```

### Setting custom credentials

You can also configure the default `password` for the `sa` user. However, it is *very important* to note that these things get set the **FIRST TIME YOU START** the service and **ONLY THE FIRST TIME.**

This means that if you change any of the `creds`, you need to `lando destroy` and then `lando start` the service for the changes to take effect. This stands in contrast to the normal `lando rebuild` method to change config and is a consequence of persisting the database's data directory between rebuilds.

```yaml
services:
  myservice:
    type: mssql
    creds:
      user: he11oTHERE -> 1337PASSword
```

```bash
lando destroy -y && lando start
```

## Getting information

You can get connection and credential information about your mssql instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

<RelatedGuides tag="Databases"/>
