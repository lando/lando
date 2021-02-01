---
description: Add a highly configurable node service to Lando for local development with all the power of Docker and Docker Compose; includes npm and yarn for dependencies funsies.
---

# Node

[Node.js](https://nodejs.org/en/) is a JavaScript runtime built on Chrome's V8 JavaScript engine and uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. Beyond running web applications, it is also commonly used for frontend tooling.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [14](https://hub.docker.com/r/_/node/)
*   [13](https://hub.docker.com/r/_/node/)
*   [12.4 - 12.16](https://hub.docker.com/r/_/node/)
*   [12](https://hub.docker.com/r/_/node/)
*   [11](https://hub.docker.com/r/_/node/)
*   [11.4 - 11.15](https://hub.docker.com/r/_/node/)
*   **[10](https://hub.docker.com/r/_/node/)** **(default)**
*   [10.14 - 10.19](https://hub.docker.com/r/_/node/)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated (e.g. YMMV and do not expect a ton of support if you have an issue).

*   [8](https://hub.docker.com/r/_/node/)
*   [8.14](https://hub.docker.com/r/_/node/)
*   [6](https://hub.docker.com/r/_/node/)
*   [6.15](https://hub.docker.com/r/_/node/)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: node:12.13
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/library/node/tags/) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: node:10
    ssl: false
    command: tail -f /dev/null
    globals: []
    port: 80
```

### Specifying a command

Note that if you *do not* define a `command` for this service, it will effectively be a "cli" container (e.g. it will not serve or run an application by default but will be available to run `node` commands against).

If you want to actually launch a `node` application, consider setting the `command` to something as shown below:

```yaml
services:
  myservice:
    type: node
    command: npm start
```

### Setting a port

While we assume your `node` service is running on port `80`, we recognize that many `node` app's also run on port `3000` or otherwise. You can easily change our default to match whatever your app needs. If your `node` service doesn't require an exposed port, you can also set `port` to `false` to disable the default port `80` mapping.

Note that if you set either `port` or `ssl` to a value less than `1024` then Lando will run the `command` as `root` otherwise it will run as the `node` user which for all intents and purposes is `you`.

```yaml
services:
  myservice:
    type: node
    port: 3000
```

### Using SSL

Also note that `ssl: true` will only generate certs in the [default locations](./../config/security.md) and expose port `443`. It is up to the user to use the certs and secure port correctly in their application like the `node` snippet below:

```js
// Get our key and cert
const key = fs.readFileSync('/certs/cert.key')
const cert = fs.readFileSync('/certs/cert.crt'),

// Create our servers
https.createServer({key, cert}, app).listen(443);
http.createServer(app).listen(80);

// Basic HTTP response
app.get('/', (req, res) => {
  res.header('Content-type', 'text/html');
  return res.end('<h1>I said "Oh my!" What a marvelous tune!!!</h1>');
});
```

You can also set `ssl` to a specific port. This will do the same thing as `ssl: true` except it will expose the port you specify instead of `443`.

```yaml
services:
  myservice:
    type: node
    port: 3000
    ssl: 4444
```

### Installing global dependencies

You can also use the `globals` key if you need to install any [global node dependencies](https://docs.npmjs.com/cli/install). This follows the same syntax as your normal [`package.json`](https://docs.npmjs.com/files/package.json) except written as YAML instead of JSON.

::: tip Use package.json if you can!
While there are some legitimate use cases to globally install a node dependency, it is almost always preferred to install using your applications normal `package.json` and then running either `lando npm` or `lando yarn` or alternatively setting up a [build step](./../config/services.md#build-steps) that will automatically run before your app starts up.

Note that both `lando yarn` and `lando npm` are not provided out of the box by the `node` service and need to be manually added by configuring your app's [tooling](./../config/tooling.md).
:::

An example of globally installing the `latest` `gulp-cli` is shown below:

```yaml
services:
  myservice:
    type: node
    globals:
      gulp-cli: latest
    command: npm start
```

An example of using a [build step](./../config/services.md#build-steps) to automatically `yarn install` your dependencies before your app invokes `yarn start-app` is shown below:

```yaml
services:
  myservice:
    type: node
    build:
      - yarn install
    command: yarn start-app
```

## Path Considerations

Lando will set the `PATH` hierarchy for this service as follows:

```js
[
  '/app/node_modules/.bin',
  '/usr/local/sbin',
  '/usr/local/bin',
  '/usr/sbin',
  '/usr/bin',
  '/sbin',
  '/bin',
]
```

This is useful to note if you are not using absolute paths in any [tooling routes](./../config/tooling.md) and are getting the unexpected version of a particular utility.

<RelatedGuides tag="Node"/>
