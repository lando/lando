---
description: Add a highly configurable python service to Lando for local development with all the power of Docker and Docker Compose.
---

# Python

[Python](https://www.python.org/) is a programming language that lets you work more quickly and integrate your systems more effectively.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [3](https://hub.docker.com/r/_/python/)
*   **[3.7](https://hub.docker.com/r/_/python/)** **(default)**
*   [3.6](https://hub.docker.com/r/_/python/)
*   [3.5](https://hub.docker.com/r/_/python/)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated (e.g. YMMV and do not expect a ton of support if you have an issue).

*   [2.7](https://hub.docker.com/r/_/python/)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: python:3.5.6
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/library/python/tags/) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: python:3.7
    port: 80
    ssl: false
    command: tail -f /dev/null
```

### Specifying a command

Note that if you *do not* define a `command` for this service, it will effectively be a "cli" container (e.g. it will not serve or run an application by default but will be available to run `python` commands against).

If you want to actually launch a `python` application, consider setting the `command` to something as shown below:

```yaml
services:
  myservice:
    type: python
    command: /app/my-server.py
```

### Setting a port

While we assume your `python` service is running on port `80`, we recognize that many `python` app's also run on port `8000` or otherwise. You can easily change our default to match whatever your app needs.

```yaml
services:
  myservice:
    type: python
    port: 8000
```

### Using SSL

Also note that `ssl: true` will only generate certs in the [default locations](./../config/security.md). It is up to the user to use the certs and secure port correctly in their application like as in the `python` snippet below:

```yaml
services:
  myservice:
    type: python
    ssl: true
    port: 443
```

```python
// Starting HTTPS server
httpsd = HTTPServer(('0.0.0.0', 443), myHandler)
httpsd.socket = ssl.wrap_socket (httpsd.socket, server_side=True, certfile='/certs/cert.crt', keyfile='/certs/cert.key')
print('starting https server...')
httpsd.serve_forever()
```

## Path Considerations

Lando will set the `PATH` hierarchy for this service as follows:

```js
[
  // Line directly below is your PYTHONUSERBASE
  '/var/www/.local/bin',
  '/usr/local/sbin',
  '/usr/local/bin',
  '/usr/sbin',
  '/usr/bin',
  '/sbin',
  '/bin',
]
```

This is useful to note if you are not using absolute paths in any [tooling routes](./../config/tooling.md) and are getting the unexpected version of a particular utility.

<RelatedGuides tag="Python}"/>
