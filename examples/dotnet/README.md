dotnet Example
==============

This example provides a basic dotnet web application.

See the `.lando.yml` in this directory for dotnet configuration options.

Start it
--------

Run the following steps to get up and running with this example.

```bash
# Start up a very basic dotnet app
lando start
```

Validate things
---------------

```bash
# Verify we can access our app
lando ssh -c "curl localhost | grep Hello"

# Verify we have the dotnet cli
lando dotnet --version
```

Purge
-----

Clean up

```bash
# Destroy the dotnet app
lando destroy -y
```
