MsSQL Example
=============

This example provides a very basic `mssql` service.

See the `.lando.yml` in this directory for `mssql` configuration options.

Getting Started
---------------

You should be able to run the following steps to get up and running with this example.

You will likely need to increase the default memory requirements of your docker host in order to run this service. If you are unsure whether you have enough memory run `lando logs -s database | grep 3250` and if you get a response, increase your memory and then `lando restart`.

```bash
# Start up the example
lando start

# Check out other commands you can use with this example
lando
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Drop into a DB shell
lando sqlcmd -U sa -H database -P he11oTHERE

# Run bcp commands
lando bcp
```
