Mongo Example
==============

This example provides a very basic `mongo` example built on Lando NodeJS things.

See the `.lando.yml` in this directory for `mongo` configuration options.

Boot it
-------

Run the following commands to get up and running with this example.

```bash
# Start up the mongo
lando start
```

Validation Commands
-------------------

Run the following commands to confirm things

```bash
# Verify mongo portforward
docker inspect mongo_database_1 | grep HostPort | grep 27018
lando info | grep port | grep 27018

# Verify the mongo cli is there and we have the correct mongo version
lando mongo --version | grep v3.5.

# Verify the database was setup correctly
lando ssh appserver -c "curl localhost | grep db | grep test"

# Verify the custom config file was used
lando ssh database -c "cat /tmp/mongod.log && cat /config.yml"
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run node commands
lando npm -v
lando node -v

# Drop into the mongo cli
lando mongo
```

Destruction
-----------

Run the following commands to clean up

```bash
# Destroy the mongo
lando destroy -y
```
