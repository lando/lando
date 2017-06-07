usage
=====

```bash
Usage: lando <command> [args] [options] [-- global options]

Commands:
  config                   Display the lando configuration
  destroy [appname]        Destroy app in current directory or [appname]
  info [appname]           Prints info about app in current directory or [appname]
  list                     List all lando apps
  logs [appname]           Get logs for app in current directory or [appname]
  poweroff                 Spin down all lando related containers
  rebuild [appname]        Rebuilds app in current directory or [appname]
  restart [appname]        Restarts app in current directory or [appname]
  start [appname]          Start app in current directory or [appname]
  stop [appname]           Stops app in current directory or [appname]
  version                  Display the lando version
  ssh [appname] [service]  SSH into [service] in current app directory or [appname]

Options:
  --help, -h  Show help                                                [boolean]

Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output

You need at least one command before moving on
```

> #### Note::Global vs. App context
>
> If you are in a directory (or subdirectory) that contains a `.lando.yml` file there is no need to pass in `[appname]` as an argument to commands like `lando restart`.


Examples
--------

```bash
# Display usage
lando

# Get config with some verbosity
lando config -- -vv

# Start an app while inside of an app directory
lando start

# Stop an app from anywhere
lando stop myapp

# Get help on destroy
lando destroy --help

# Non-interactively destroy an app called myapp with max verbosity
lando destroy myapp -y -- -vvvv

# Run a php command against myapp's appserver container
lando ssh myapp appserver -c "php -i"
```

Tooling Commands
----------------

Each app may implement special kinds of [tooling commands](./../config/tooling.md) that are only available while in that app context. These commands are usually wrappers for development tools like `lando composer` or `lando artisan` or `lando npm`.

Run `lando` inside of an app to see if it offers any app specific tooling options.

```bash
Usage: lando <command> [args] [options] [-- global options]

Commands:
  config                   Display the lando configuration
  destroy [appname]        Destroy app in current directory or [appname]
  info [appname]           Prints info about app in current directory or [appname]
  list                     List all lando apps
  logs [appname]           Get logs for app in current directory or [appname]
  poweroff                 Spin down all lando related containers
  rebuild [appname]        Rebuilds app in current directory or [appname]
  restart [appname]        Restarts app in current directory or [appname]
  start [appname]          Start app in current directory or [appname]
  stop [appname]           Stops app in current directory or [appname]
  version                  Display the lando version
  ssh [appname] [service]  SSH into [service] in current app directory or [appname]
  composer                 Run composer commands
  php                      Run php commands
  mysql                    Drop into a MySQL shell

Options:
  --help, -h  Show help                                                [boolean]

Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output

You need at least one command before moving on
```

Global Options
--------------

Lando uses the `--` separator for global options. The reason for this is we need a way to differentiate between options that might be intended for a subcommand eg `lando drush --verbose` vs global options that are for Lando itself. Consider the difference between `lando npm install -v` vs `lando npm install -- -v`. The former tells `npm` to give us verbose output whereas the latter tells `lando` to give us verbose output.

The following global options are available for every command.

```bash
Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output
```
