PHP Apache Services Example
===========================

This example provides a very basic `LAMP` application using Lando services instead of a recipe.

See the `.lando.yml` in this directory for PHP configuration options.

This is the dawning of the age of LAMPquarius
---------------------------------------------

Run the following steps to get up and running with this example.

```bash
# Starts up a LAMP stack using lando services
lando start
```

Helpful commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run LAMP dev tools
lando php -v
lando composer
lando mysql
```

Sanity checks
-------------

Run these commands to make sure things are right as rain.

```bash
# Verify that we are being served by apache
lando ssh appserver -c "curl -Ik https://localhost | grep Server | grep Apache"

# Verify the php cli exists and has the right version
lando php -v | grep 5.3.

# Verify the webroot is set correctly
lando ssh appserver -c "env | grep LANDO_WEBROOT=/app/www"

# Verify we have the xdebug extension
lando php -m | grep Xdebug

# Verify mysql portforward
docker inspect lamp_database_1 | grep HostPort | grep 3308
lando info | grep port | grep 3308

# Verify the databases was setup correctly
lando ssh database -c "mysql -ulamp -plamp lamp -e\"quit\""

# Verify we have the composer tool
lando composer --version

# Verify we have the mysql cli
lando mysql -V
```

Nuke the whole god damn thing
-----------------------------

Run these commands to ensure we clean things up.

```bash
# Destroys the LAMP stack
lando destroy -y
```
