LEMP Recipe Example
===================

This example provides a very basic `lemp` recipe example.

See the `.lando.yml` in this directory for LEMP configuration options.

Start me up!
------------

Run the following steps to get up and running with this example.

```bash
# Starts up a LEMP stack using lando recipes
lando start
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Run LEMP dev tools
lando php -v
lando composer
lando mysql
# This should fail
lando phplint

# Run NODE dev tools
lando node -v
lando npm -v
```

Verify things are in order
--------------------------

Run these commands to make sure things are right as rain.

```bash
# Verify that we are being served securely by nginx
lando ssh appserver -c "curl -Ik https://nginx | grep Server | grep nginx"

# Verify the php cli exists and has the right version
lando php -v | grep 7.2.

# Verify the webroot is set correctly
lando ssh appserver -c "env | grep LANDO_WEBROOT=/app"

# Verify we have the xdebug extension
lando php -m | grep Xdebug

# Verify the databases was setup correctly
lando ssh database -c "mysql -ulemp -plemp lemp -e\"quit\""

# Verify we have the composer tool
lando composer --version

# Verify we have the mysql cli and its using mysql
lando mysql -V | grep mysql

# Verify our custom php settings
lando php -i | grep memory_limit | grep 1024M
```

Destroy the app
---------------

Run these commands to ensure we clean things up.

```bash
# Destroys the LEMP stack
lando destroy -y
```
