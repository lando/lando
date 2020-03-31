---
metaTitle: lando destroy | Lando
description: lando destroy completely destroys your application eg all data will be lost after running this command.
---

# destroy

Destroys your app.

After you run this command you will not be able to access the app or use Lando tooling for development unless you restart the app. The files (eg the git repo) for the app will not be removed but any database or index information will be _irretrievably lost_.

::: warning Only destroys an app, not Lando itself!
This command should not be confused with uninstalling Lando. It **will only** destroy the app that you use it on.
:::

## Usage

```bash
# Interactive destruction
lando destroy

# Non-interactive destruction
lando destroy -y

# Destroy with debug output
lando destroy -vvv

# Get help about the destroy command
lando destroy --help
```

## Options

```bash
--help         Shows lando or delegated command help if applicable
--verbose, -v  Runs with extra verbosity
--yes, -y      Auto answer yes to prompts
```
