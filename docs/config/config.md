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

Examples
--------

These examples assume you have a config source at `~/.lando/config.yml`

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
