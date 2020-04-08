---
metaTitle: lando list | Lando
description: lando list lists all running lando apps and containers and is filterable.
---

# list

Lists all running lando apps and containers.

Optionally you can include show not running services with `--all` or filter by `--app`.

## Usage

```bash
# Get all running lando services
lando list

# Get all lando services regardless of running status
lando list --all

# Get all services for an app called my-app regardless of running status
lando list -a --app my-app

# Get all services of kind=service, note the quotes are important
lando list --filter "kind=service"

# Get all the data as json
lando list --all --format json

# Get the name for the first service of a given app, note the quote are important
lando list --path "my-app.[0].service"
```

## Options

```bash
--all, -a      Show all containers, even those not running
--app          Show containers for only a particular app
--filter, -f   Filter by "key=value"
--format       Output in given format: json
--help         Shows lando or delegated command help if applicable
--verbose, -v  Runs with extra verbosity
--path, -p     Only return the value at the given path
```
