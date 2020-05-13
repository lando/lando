---
description: Add a highly configurable ruby service to Lando for local development with all the power of Docker and Docker Compose.
---

# Ruby

[Ruby](https://www.ruby-lang.org/en/) A dynamic, open source programming language with a focus on simplicity and productivity. It has an elegant syntax that is natural to read and easy to write.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [2.6](https://hub.docker.com/r/_/ruby/)
*   **[2.5](https://hub.docker.com/r/_/ruby/)** **(default)**
*   [2.4](https://hub.docker.com/r/_/ruby/)
*   [2.3](https://hub.docker.com/r/_/ruby/)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated (e.g. YMMV and do not expect a ton of support if you have an issue).

*   [1.9](https://hub.docker.com/r/_/ruby/)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: ruby:2.5.3
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/library/ruby/tags/) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: ruby:2.5
    port: 80
    command: tail -f /dev/null
```

### Specifying a command

Note that if you *do not* define a `command` for this service, it will effectively be a "cli" container (e.g. it will not serve or run an application by default but will be available to run `ruby` commands against).

If you want to actually launch a `ruby` application, consider setting the `command` to something as shown below:

```yaml
services:
  myservice:
    type: ruby
    command: ruby /app/my-server.rb
```

### Setting a port

While we assume your `ruby` service is running on port `80`, we recognize that many `ruby` apps also run on port `8080` or otherwise. You can easily change our default to match whatever your app needs.

```yaml
services:
  myservice:
    type: ruby
    port: 8080
```

## Path Considerations

Lando will set the `PATH` hierarchy for this service as follows:
```js
[
  '/usr/local/sbin',
  '/usr/local/bin',
  '/usr/local/bundle/bin',
  '/usr/sbin',
  '/usr/bin',
  '/sbin',
  '/bin',
]
```

This is useful to note if you are not using absolute paths in any [tooling routes](./../config/tooling.md) and are getting the unexpected version of a particular utility.

<RelatedGuides tag="Ruby"/>
