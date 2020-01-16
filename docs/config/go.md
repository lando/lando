---
description: Add a highly configurable go service to Lando for local development with all the power of Docker and Docker Compose.
---

# Go

[Go](https://golang.org/) is an open source programming language that makes it easy to build simple, reliable, and efficient software.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   **[1.11](https://hub.docker.com/_/golang/)** **(default)**
*   [1.10](https://hub.docker.com/_/golang/)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated eg YMMV and do not expect a ton of support if you have an issue.

*   [1.9](https://hub.docker.com/_/golang/)
*   [1.8](https://hub.docker.com/_/golang/)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service they are not *officially* supported so if you use one YMMV.
:::

To use a patch version you can do something like this:

```yaml
services:
  my-service:
    type: go:1.10.7
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/library/golang/tags/) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that the below options are in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service.

```yaml
services:
  my-service:
    type: go:1.11
    ssl: false
    command: tail -f /dev/null
```

### Specifying a command

Note that if you *do not* define a `command` for this service it will effectively be a "cli" container eg it will not serve or run an application by default but will be available to run `go` commands against.

If you want to actually launch a `go` application consider setting the `command` to something like:

```yaml
services:
  my-service:
    type: go
    command: run /app/my-server.go
```

### Using SSL

Also note that `ssl: true` will only generate certs in the [default locations](./../config/security.md) and expose port `443`. It is up to user to use the certs and secure port correctly in their application like as in this `go` snippet:

```go
// Starting HTTPS server
go func() {
  log.Printf("Staring HTTPS service on :443")
  if err := http.ListenAndServeTLS(":443", "/certs/cert.crt", "/certs/cert.key", nil); err != nil {
    // Not important for this example
  }
}()
```

<RelatedGuides tag="Go"/>
