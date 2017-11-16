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

This file specifies the core configuration options for Lando. If you wanted to fork Lando and use your own plugins or alter plugin config like proxy ports, this is the file you would want to change. Lando will scan a few different directories for the presence of a `config.yml` file. If it finds one, it will override the default config. The order of the overrides is below:

1.  The default `config.yml`. If you've installed Lando from source this will be in the source root.
2.  The `config.yml` inside of the `sysConfRoot`. For example `/usr/share/lando` on Linux.
3.  The `config.yml` inside of the `userConfRoot`. For examples `~/.lando/` on macOS.

> #### Hint::Where are `sysConfRoot` and `userConfRoot`?
>
> Run `lando config` to find the location of these directories as they can be different.

Examples
--------

### Turning the proxy off

```bash
echo "proxy: 'OFF'" >> ~/.lando/config.yml
```
