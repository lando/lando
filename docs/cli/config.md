config
======

Displays the lando configuration.

*Almost all* of these options can be overriden via the Lando global `config.yml`. See the [config system](../config/config.md) for more info.

Usage
-----

```bash
# Show me a config worthy of lando
lando config

# Show me only the "mode"
lando config -f mode
```

Options
-------

```bash
--clear        Clears the lando tasks cache
--lando        Show help for lando-based options
--verbose, -v  Runs with extra verbosity
--field, -f    Show only a specific field
```
