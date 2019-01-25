dotnet
======

[Dotnet](https://en.wikipedia.org/wiki/.NET_Framework) is a software framework developed by Microsoft that runs primarily on Microsoft Windows. It includes a large class library named Framework Class Library (FCL) and provides language interoperability (each language can use code written in other languages) across several programming languages.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.yml).

Supported versions
------------------

*   **[2](https://hub.docker.com/r/microsoft/dotnet/)** **(default)**
*   [2.0](https://hub.docker.com/r/microsoft/dotnet/)
*   [custom](./../config/services.md#advanced)

Legacy versions
---------------

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated eg YMMV and do not expect a ton of support if you have an issue.

*   [1](https://hub.docker.com/r/microsoft/dotnet/)
*   [1.1](https://hub.docker.com/r/microsoft/dotnet/)
*   [1.0](https://hub.docker.com/r/microsoft/dotnet/)

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
    type: dotnet:2.0
    ssl: false
    command: tail -f /dev/null
```

### Specifying a command

Note that if you *do not* define a `command` for this service it will effectively be a "cli" container eg it will not serve or run an application by default but will be available to run `dotnet` commands against.

If you want to actually launch a `dotnet` application consider setting the `command` to something like

```yaml
services:
  my-service:
    type: dotnet
    command: dotnet run
```

### Using SSL

Also note that `ssl: true` will only generate certs in the [default locations](./../config/security.md) and expose port `443`. It is up to user to use the certs and secure port correctly in their application like as in [this article](https://asp.net-hacker.rocks/2018/07/05/aspnetcore-ssl.html).

Example
-------

If you are interested in a working example of this service that we test on every Lando build then check out
[https://github.com/lando/lando/tree/master/examples/dotnet](https://github.com/lando/lando/tree/master/examples/dotnet)
