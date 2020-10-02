---
metaTitle: lando config | Lando
description: lando config displays the lando configuration.
---

# config

Displays the lando configuration.

You can also use `--field` to only display a single config value. *Almost all* of these options can be overridden via the Lando global `config.yml`. See the [config system](./../config/global.md) for more info.

## Usage

```bash
# Show me a config worthy of lando
lando config

# Show me only the "mode"
lando config --path mode

# Show me in json
lando config --format json
```

## Options

```bash
--format       Output in given format: json
--help         Shows lando or delegated command help if applicable
--verbose, -v  Runs with extra verbosity
--path, -p     Only return the value at the given path
```
