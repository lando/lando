Config System
=============

The Kalabox config system is highly flexible and allows you to configure a few things, such as...

  * The default domain suffix.
  * The plugins it should load.
  * The plugin that contains the engine implementation.

kalabox.yaml
-------------

This file specifies the core configuration options for Kalabox. If you wanted to fork Kalabox and use your own config or plugins this is the file you would want to change. Kalabox will scan a few different directories for the presence of a `kalabox.yml` file. If it finds one it will override the default config. Here is the order the overrides take place.

  1. The default `kalabox.yml`. If you've installed Kalabox from source this will be in the source root.
  2. The `kalabox.yml` inside of the `sysConfRoot`. For example `/usr/share/kalabox` on Linux.
  3. The `kalabox.yml` inside of the `userConfRoot`. For examples `~/.kalabox/` on macOS.

!!! attention "Where are `sysConfRoot` and `userConfRoot`?"
    Run `kbox config` to find the location of these directories as they can be different.

Here is the default `kalabox.yml` file as of `v0.13.x`.

```yaml
#
# Domain
#
# You can change the domain suffix used by default. The support level of
# this setting is currently unknown.
#
domain: kbox.site

#
# Global plugins
#
# These are plugins that Kalabox should load by default.
#   Inside of Kalabox source/binary
#
globalPlugins:
  - kalabox-core
  - kalabox-cmd
  - kalabox-services-kalabox
  - kalabox-sharing
  - kalabox-ui

#
# Console log level
#
# Determines the verbosity with which messages are printed to the screen
#
#   Options: [debug|info|none]
#
logLevelConsole: none

#
# Log level
#
# Determines the verbosity with which messages are added to the log
#
#   Options: [debug|info|none]
#
# logLevel: debug

#
# Engine
#
# The engine is a special kind of plugin that implements the Kalabox container
# interface.
#
#   Options: [plugin-name]
#
# You generally are not going to want to change this unless you've got a
# good replacement
#
engine: kalabox-engine-docker

```

!!! tip "What things can I override?"
    Anything that shows up in `kbox config` is overrideable. That said, take caution, as some settings should not be altered.
