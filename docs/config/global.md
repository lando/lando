---
description: Almost all parts of how Lando itself works are configurable, from proxy domains and ports to the name of the Landofile to the max size of Lando logs.
---

# Global Config

::: warning With great power comes great ability to really mess things up!
If you do not have a **VERY** good idea about how to modify the Lando global config, it is *highly recommended* that you do not!
:::

You can also configure how Lando itself works using a file called `config.yml`. This config system is highly flexible and allows you to override basically anything that shows up when you run `lando config`. A few more common overrides are:

*   Any `plugins` Lando should not autoload
*   The verbosity of Lando's logs and console output
*   The directories Lando scans for plugins
*   The directories Lando scans for the `config.yml` itself.
*   The config of various loaded plugins

Note that there are some configuration options **THAT MUST** be set during the bootstrap of the `lando` object. For more information about how to bootstrap your own custom `lando` object, please consult the [Lando API](./../api/lando.html#lando).

[[toc]]

## config.yml

This file specifies the core configuration options for Lando. Lando will scan a few different directories for the presence of a `config.yml` file. If it finds one, it will override the default config. **PLEASE NOTE THAT THIS FILE IS DIFFERENT THAN YOUR LANDOFILE!** If you add any of these settings to your Landofile, the expected result should be "nothing happens".

::: tip What directories are scanned?
Run `lando config` and look at the `configSources` key to find what directories are scanned for config.
:::

Note that overrides will be merged in successively. This means the values in the last `configSources` take priority.

## Environment Variables

You can also override any global config value using environment variables of the form `envPrefix_config_value`. So to change the `mode` you'd set:

```bash
export LANDO_MODE=mymode
```

For more complex config (e.g. an object or array), you can set the envvar to a `JSON` string and Lando will parse it for you. Note that Lando keys that are `camelCase` will be separated as envvars with `_`. For example, `engineConfig` will be accessible vis `LANDO_ENGINE_CONFIG`.

::: tip What is my `envPrefix`?
By default, this is `LANDO` but you can run `lando config` and look at the `envPrefix` key to discover yours.
:::

## Examples

### Turning the proxy off

```bash
# Edit the config
echo "proxy: 'OFF'" >> ~/.lando/config.yml

# Poweroff lando
lando poweroff

# Reboot an app
lando start SOMEAPP
```

### Set a bunch of custom stuff using a yaml file

Place this `yaml` file in at `~/.lando/config.yml`. An example of a few things you can modify is shown below:

```yaml
# Use a different docker daemon
# NOTE: This is not officially supported and should be used only under the most
# dire of circumstances
engineConfig:
  host: 127.0.0.1
  port: 4333
  socketPath: null

# Make console log very silly
logLevelConsole: silly

# Disable the core plugin
# NOTE: Not a good idea
disablePlugins:
  - lando-core

# Change the default bind address to 0.0.0.0
# Note that this has security implications
bindAddress: "0.0.0.0"
```

### Set a config value through an ENVVAR

This assumes you are using `LANDO` as the `envPrefix`.

```bash
# Check the current config value for mode
lando config | grep mode
# "mode": "cli",

# Override with an envvar
export LANDO_MODE=mymode

# Check the new value
lando config | grep mode
# "mode": "mymode",
```

### Set complicated config through an ENVVAR

```bash
# Check the current engine config
lando config
"engineConfig": {
  "host": "127.0.0.1",
  "socketPath": "/var/run/docker.sock"
},

# Override with an envvar
export LANDO_ENGINE_CONFIG='{"host": "localhost"}'

# Check the new value
lando config
"engineConfig": {
  "host": "localhost",
  "socketPath": "/var/run/docker.sock"
},
```
