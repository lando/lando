---
metaTitle: Lando CLI Usage, How Do I Use It? | Lando
description: Lando is a CLI driven tool by default, here are all the out of the box commands it runs.
---

# CLI Usage

While Lando is actually a library that can be implemented various ways it ships with a command line interface by default. The command line interface is dynamic which means if it detects a `Landofile` it will augment your list of available commands with any relevant `tooling` that has been set up by that `Landofile`.

**If you do not run most of these commands in a directory that contains a Landofile you will likely not get the expected result.**

::: warning Windows users must use a real, non-emulated, TTY
This is an upstream "restriction" imposed on us by NodeJS and python. We recommend using the shell shipped with [Git for Windows](https://gitforwindows.org/) but only the `cmd.exe` variant NOT the one powered by `minTTY`. That said your safest bet is to use `cmd.exe` or `PowerShell`. Other shells may work but have not been tested.

If your shell does not work you will likely see an error message like `the input device is not a TTY.`
See [https://github.com/nodejs/node/issues/3006](https://github.com/nodejs/node/issues/3006)
:::

## Default Commands

The *usual suspects* are available and you can read more about each of them in detail below.

```bash
Usage: lando <command> [args] [options]

Commands:
  lando config    Displays the lando configuration
  lando destroy   Destroys your app
  lando info      Prints info about your app
  lando init      Initializes code for use with lando
  lando list      Lists all running lando apps and containers
  lando logs      Displays logs for your app
  lando poweroff  Spins down all lando related containers
  lando rebuild   Rebuilds your app from scratch, preserving data
  lando restart   Restarts your app
  lando share     Shares your local site publicly
  lando ssh       Drops into a shell on a service, runs commands
  lando start     Starts your app
  lando stop      Stops your app
  lando version   Displays the lando version

Options:
  --channel       Sets the update channel
  --clear         Clears the lando tasks cache
  --experimental  Activates experimental features
  --help          Shows lando or delegated command help if applicable
  --verbose, -v   Runs with extra verbosity

Examples:
  lando start            Run lando start
  lando rebuild --help  Get help about using the lando rebuild command
  lando destroy -y -vvv  Run lando destroy non-interactively and with maximum verbosity
  lando --clear          Clear the lando tasks cache

You need at least one command before moving on
```

Read more about

*   [lando config](config.md)
*   [lando destroy](destroy.md)
*   [lando init](init.md)
*   [lando info](info.md)
*   [lando list](list.md)
*   [lando logs](logs.md)
*   [lando poweroff](poweroff.md)
*   [lando rebuild](rebuild.md)
*   [lando restart](restart.md)
*   [lando share](share.md)
*   [lando ssh](ssh.md)
*   [lando start](start.md)
*   [lando stop](stop.md)
*   [lando version](version.md)

## With tooling

Each Landofile may implement _additional_ [tooling commands](./../config/tooling.md) that are only available for that application. These commands are usually wrappers for development tools like `lando composer` or `lando artisan` or `lando npm`.

Run `lando` inside of an app to see if it offers any app specific tooling options. Here is an example of what the default `lamp` recipe will give you. Note the additional app-specific commands like `lando composer` and `lando db-import`.

```bash
Usage: lando <command> [args] [options]

Commands:
  lando composer          Runs composer commands
  lando config            Displays the lando configuration
  lando db-export [file]  Exports database from a service into a file
  lando db-import <file>  Imports a dump file into database service
  lando destroy           Destroys your app
  lando info              Prints info about your app
  lando init              Initializes code for use with lando
  lando list              Lists all running lando apps and containers
  lando logs              Displays logs for your app
  lando mysql             Drops into a MySQL shell on a database service
  lando php               Runs php commands
  lando poweroff          Spins down all lando related containers
  lando rebuild           Rebuilds your app from scratch, preserving data
  lando restart           Restarts your app
  lando share             Shares your local site publicly
  lando ssh               Drops into a shell on a service, runs commands
  lando start             Starts your app
  lando stop              Stops your app
  lando version           Displays the lando version

Options:
  --channel       Sets the update channel
  --clear         Clears the lando tasks cache
  --experimental  Activates experimental features
  --help          Shows lando or delegated command help if applicable
  --verbose, -v   Runs with extra verbosity

Examples:
  lando start            Run lando start
  lando rebuild --help  Get help about using the lando rebuild command
  lando destroy -y -vvv  Run lando destroy non-interactively and with maximum verbosity
  lando --clear          Clear the lando tasks cache

You need at least one command before moving on
```
