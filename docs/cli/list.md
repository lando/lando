list
====

Lists all running lando apps and containers.

Optionally you can include show not running services with `--all` or filter by `--app`.

Usage
-----

```bash
# Get all running lando services
lando list

# Get all lando services regardless of running status
lando list --all

# Get all services for an app called my-app regardless of running status
lando list -a --app my-app

# Get all services of kind=service, note the quotes are important
lando list --filter "kind=service"
```

Options
-------

```bash
--all, -a      Show all containers, even those not running
--app          Show containers for only a particular app
--clear        Clears the lando tasks cache
--filter, -f   Filter by "key=value"
--help         Shows lando or delegated command help if applicable
--verbose, -v  Runs with extra verbosity
```
