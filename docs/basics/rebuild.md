---
metaTitle: lando rebuild | Lando
description: lando rebuild rebuilds your app from scratch, preserving data and re-running any configured build steps as though you were starting your app for the first time.
---

# rebuild

Rebuilds your app from scratch, preserving data.

This will rebuild your app as though you were starting it for the first time, while preserving any database data. If you change your Landofile you'll want to run `lando rebuild` for these changes to take effect. This is also a great command to run if your app has gotten into a bad state and you want to set things right.

::: tip Rebuild vs restart?
As of Lando 3.0.0-rc.1 you must explicitly invoke `lando rebuild` for changes in your Landofile to take effect. `lando restart` is now designed to preserve container state so that you do not get unexpected changes unless you have asked for them.
:::

## Usage

```bash
# Rebuild an app
lando rebuild

# Non-interactive rebuild
lando rebuild --yes

# Rebuild only the appserver and cache services
lando rebuild -s cache -s appserver
```

## Options

Run `lando rebuild --help` to get a complete list of options defaults, choices, etc.

```bash
--help          Shows lando or delegated command help if applicable
--services, -s  Rebuild only the specified services
--verbose, -v   Runs with extra verbosity
--yes, -y       Auto answer yes to prompts
```
