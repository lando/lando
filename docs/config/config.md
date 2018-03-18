Global Config
=============

You can also configure how Lando itself works with a `config.yml`. This config system is highly flexible and allows you to configure a few things, such as...

*   Plugins it should load
*   The verbosity of its logs and console output
*   The location of its config directories
*   The config of its loaded plugins

> #### Info::Discover other configs
>
> Check out [`lando config`](../cli/config.md) for a full list of config options.

config.yml
----------

This file specifies the core configuration options for Lando. Lando will scan a few different directories for the presence of a `config.yml` file. If it finds one, it will override the default config.

> #### Hint::What directories are scanned?
>
> Run `lando config` and look at the `configSources` key to find what directories are scanned for config.

Note that overrides will be merged in with the last value in `configSources` taking priority. Also note that there are some configuration options **THAT MUST** be set during the bootstrap of the `lando` object. For more information about how to bootstrap your own custom `lando` object please consult the [API docs](./../api/api.html#lando).

Environment Variables
---------------------

You can also override any global config value using environment variables of the form `envPrefix_config_value`. So to change the `mode` you'd set `LANDO_MODE=mymode`. For more complex config (eg an object or array) you can set the envvar to a `JSON` string. Also note that Lando keys that are camelCase will be separated as envvars with `_`. For example `engineConfig` will be accessible vis `LANDO_ENGINE_CONFIG`.

> #### Hint::What is my `envPrefix`
>
> BY default this is `LANDO` but you can run `lando config` and look at the `envPrefix` key to discover yours.

Examples
--------

### Turning the proxy off

```bash
# Edit the config
echo "proxy: 'OFF'" >> ~/.lando/config.yml

# Poweroff lando
lando poweroff

# Reboot an app
lando start SOMEAPP
```

### Set some custom default activity

Place this `yaml` file in at `~/.lando/config.yml`

```yaml
# Add some envvars the get injected into every lando app container
containerGlobalEnv:
  GETTINGBACKTOGETHER: NEVER

# Use a different docker daemon
# NOTE: This is not official supported
engineConfig:
  host: 127.0.0.1
  port: 4333
  socketPath: null

# Make console log very silly
logLevelConsole: silly

# Load additional custom plugins
plugins:
  - lando-my-plugin
```

### Set a config value through an ENVVAR

This assumes you are using `LANDO` as the `envPrefix`.

```bash
# Check the current config value for mode
lando config | grep mode
// "mode": "cli",

// Override with an envvar
export LANDO_MODE=mymode

# Check the new value
lando config | grep mode
// "mode": "mymode",
```

### Set complicated config through an ENVVAR

```bash
# Check the current engine config
lando config
// "engineConfig": {
//   "host": "127.0.0.1",
//   "socketPath": "/var/run/docker.sock"
// },

// Override with an envvar
export LANDO_ENGINE_CONFIG='{"host": "localhost"}'

# Check the new value
lando config
// "engineConfig": {
//   "host": "localhost",
//   "socketPath": "/var/run/docker.sock"
// },
```
