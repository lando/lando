Postgres Example
================

This example provides a very basic `postgres` service.

See the `.lando.yml` in this directory for Postgres configuration options.

Boot it
-------

Run the following commands to get up and running with this example.

```bash
# Start up the postgres
lando start
```

Validation Commands
-------------------

Run the following commands to confirm things

```bash
# Verify postgres portforward
docker inspect postgres_tswift_1 | grep HostPort | grep 5444
lando info | grep port | grep 5444

# Verify the correct version is being used
lando ssh tswift -c "psql -V | grep 10.3"

# Verify the database was setup correctly
lando ssh tswift -c "psql -U trouble trouble -c \'\\\dt\'"

# Verify the custom config file was used
lando ssh tswift -c "psql -U trouble -c \'SHOW MAX_FILES_PER_PROCESS;\' | grep 999"
```
// psql -U postgres -c 'SHOW MAX_FILES_PER_PROCESS;'

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```
# Get DB connection info
lando info
```

Destruction
-----------

Run the following commands to clean up

```bash
# Destroy the postgres
lando destroy -y
```
