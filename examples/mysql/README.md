MySQL Example
=============

This example provides a very basic `mysql` service.

See the `.lando.yml` in this directory for MySQL configuration options.

Boot it
-------

Run the following commands to get up and running with this example.

```bash
# Start up the mysql
lando start
```

Validation Commands
-------------------

Run the following commands to confirm things

```bash
# Verify the correct version is being used
lando ssh database -c "mysql -V | grep 5.7."

# Verify the databases was setup correctly
lando ssh database -c "mysql -umysql -ppassword database -e\"quit\""
```

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
# Destroy the mysql
lando destroy -y
```
