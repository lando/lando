---
description: Add a highly configurable MariaDB service to Lando for local development with all the power of Docker and Docker Compose.
---

# MariaDB

[MariaDB](https://mariadb.org/) is a very common database server which is *EXTREMELY* similar to MySQL but has a guarantee of being open source.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [10.5](https://hub.docker.com/r/bitnami/mariadb)
*   [10.4](https://hub.docker.com/r/bitnami/mariadb)
*   **[10.3](https://hub.docker.com/r/bitnami/mariadb)** **(default)**
*   [10.2](https://hub.docker.com/r/bitnami/mariadb)
*   [10.1](https://hub.docker.com/r/bitnami/mariadb)
*   [custom](./../config/services.md#advanced)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: mariadb:10.2.21
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/mariadb/tags) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

::: warning Be careful when switching database type, version or credentials!
You should be careful switching database `type`, `version` or `creds`.

In the case of type and version, the underlying database files between these things will likely not be compatible. In the case of credentials, these are set when the container is **initially created** so in order to change them you need to `lando destroy && lando start`. Note that `lando destroy` will delete all the data in your database.


**Ignoring this warning can prevent your database service from starting**
:::

```yaml
services:
  myservice:
    type: mariadb:10.1
    portforward: false
    creds:
      user: mariadb
      password: mariadb
      database: database
    config:
      database: SEE BELOW
```

### Port forwarding

`portforward` will allow you to access this service externally by assigning a port directly on your host's `localhost`. Note that ` portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  myservice:
    type: mariadb
    portforward: true
```

**Not recommended**

```yaml
services:
  myservice:
    type: mariadb
    portforward: 3600
```

### Setting custom credentials

You can also configure the default `database`, `user` and `password`. However, it is *very important* to note that these things get set the **FIRST TIME YOU START** the service and **ONLY THE FIRST TIME.**

This means that if you change any of the `creds`, you need to `lando destroy` and then `lando start` the service for the changes to take effect. This stands in contrast to the normal `lando rebuild` method to change config and is a consequence of persisting the database's data directory between rebuilds.

```yaml
services:
  myservice:
    type: mariadb
    creds:
      user: mariadb -> myuser
      password: mariadb -> mypassword
      database: database -> db7
```

```bash
lando destroy -y && lando start
```

Also note that by default all `mariadb` services have a passwordless `root` user. **DO NOT ALTER THE PASSWORD OF THE ROOT USER.**

### Using a custom MariaDB config file

You may need to override our [default MySQL config](https://github.com/lando/lando/tree/master/plugins/lando-services/services/mariadb) with your own [custom MySQL config](https://mariadb.com/kb/en/library/configuring-mariadb-with-option-files/).

If you do this, you must use a file that exists inside your application and express it relative to your project root as shown below:

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory but you can call it whatever you want such as `.lando` in the example below:

```bash
./
|-- config
   |-- my-custom.cnf
|-- .lando.yml
```

**Landofile's mariadb config**

```yaml
services:
  myservice:
    type: mariadb
    config:
      database: config/my-custom.cnf
```

## Getting information

You can get connection and credential information about your mariadb instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

<RelatedGuides tag="Databases"/>
