---
description: Add a Microsoft dotnet service to Lando for local development with all the power of Docker and Docker Compose.
---

# dotnet

[Dotnet](https://en.wikipedia.org/wiki/.NET_Framework) is a software framework developed by Microsoft that runs primarily on Microsoft Windows. It includes a large class library named Framework Class Library (FCL) and provides language interoperability (each language can use code written in other languages) across several programming languages.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [3.1](https://hub.docker.com/_/microsoft-dotnet-sdk/)
*   **[2.1](https://hub.docker.com/_/microsoft-dotnet-sdk)** **(default)**
*   [custom](./../config/services.md#advanced)

## Unsupported versions

Due to upstream changes these no longer work.

*   [2](https://hub.docker.com/r/microsoft/dotnet/)
*   [2.0](https://hub.docker.com/r/microsoft/dotnet/)
*   [1](https://hub.docker.com/r/microsoft/dotnet/)
*   [1.1](https://hub.docker.com/r/microsoft/dotnet/)
*   [1.0](https://hub.docker.com/r/microsoft/dotnet/)

## Patch versions

This service does not support patch versions but if you **really** need something like that, you could consider using either a [custom compose service](./compose.md) or a service [overrides](./../config/services.md#overrides).

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: dotnet:2.0
    ssl: false
    command: tail -f /dev/null
    port: 80
```

### Specifying a command

Note that if you *do not* define a `command` for this service, it will effectively be a "cli" container (e.g. it will not serve or run an application by default but will be available to run `dotnet` commands against).

If you want to actually launch a `dotnet` application, consider setting the `command` to something as shown below:

```yaml
services:
  myservice:
    type: dotnet
    command: dotnet run
```

### Using SSL

Also note that `ssl: true` will only generate certs in the [default locations](./../config/security.md) and expose port `443`. It is up to the user to use the certs and secure port correctly in their application like as in [this article](https://asp.net-hacker.rocks/2018/07/05/aspnetcore-ssl.html).

### Setting a port

While we assume your `dotnet` service is running on port `80`, we recognize that many `dotnet` apps also run on port `8888` or otherwise. You can easily change our default to match whatever your app needs.

```yaml
services:
  myservice:
    type: dotnet
    port: 8888
```

<RelatedGuides tag="dotnet"/>
