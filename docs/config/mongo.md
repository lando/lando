---
description: Add a highly configurable MongoDB service to Lando for local development with all the power of Docker and Docker Compose.
---

# MongoDB

[MongoDB](https://en.wikipedia.org/wiki/MongoDB)  is a free and open-source cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with schemas.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

## Supported versions

*   [5.0](https://hub.docker.com/r/bitnami/mongodb)
*   [4.4](https://hub.docker.com/r/bitnami/mongodb)
*   **[4.2](https://hub.docker.com/r/bitnami/mongodb)**  **(default)**
*   [4.0](https://hub.docker.com/r/bitnami/mongodb)
*   [3.6](https://hub.docker.com/r/bitnami/mongodb)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated (e.g. YMMV and do not expect a ton of support if you have an issue).

*   [4.1](https://hub.docker.com/r/bitnami/mongodb)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service they are not *officially* supported so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: mongo:4.1.4
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/bitnami/mongodb/tags) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: mongo:4.0
    portforward: false
    config:
      database: SEE BELOW
```

::: warning Be careful when switching database version!
You should be careful switching database `version` because the underlying database will not be compatible unless you follow these steps to upgrade it:

If you have a current project with 4.2 that you wish to upgrade to 5.0, you need to upgrade to 4.4 first (change the version, run lando rebuild) and do the tiny step described here:
https://docs.mongodb.com/v5.0/release-notes/4.4-upgrade-standalone/

> Run the setFeatureCompatibilityVersion command against the admin database:
> db.adminCommand( { setFeatureCompatibilityVersion: "4.4" } )

Before you update the mongodb version to 5.0 and repeat the above step.

You can also use mongodump to create a backup of your database, delete the mongo instance, recreate it on a new version and use mongorestore to populate the database again.

**Ignoring this warning can prevent your database from starting**
:::


### Port forwarding

`portforward` will allow you to access this service externally by assigning a port directly on your host's `localhost`. Note that ` portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  myservice:
    type: mongo
    portforward: true
```

**Not recommended**

```yaml
services:
  myservice:
    type: mongo
    portforward: 27018
```

### Using a custom MongoDB config file

You may need to override our [default mongo config](https://github.com/lando/lando/tree/master/plugins/lando-services/services/mongo) with your own [custom mongo config](https://docs.mongodb.com/manual/reference/configuration-options/).

If you do this, you must use a file that exists inside your application and express it relative to your project root as shown below:

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory in the below example but you can call it whatever you want such as `.lando`.

```bash
./
|-- config
   |-- custom.conf
|-- .lando.yml
```

**Landofile's mongo config**

```yaml
services:
  myservice:
    type: mongo
    config:
      database: config/custom.conf
```

## Getting information

You can get connection and credential information about your mongo instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

<RelatedGuides tag="Databases"/>
