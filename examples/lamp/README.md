LEMP Recipe Example
===================

This example provides a very basic `lemp` recipe example.

See the `.lando.yml` in this directory for LEMP configuration options.

Start me up!
------------

Run the following steps to get up and running with this example.

```bash
# Starts up a LAMP stack using lando recipes
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
# Verify that we are being served by apache
lando ssh appserver -c "curl -I localhost | grep Server | grep Apache"

# Verify the php cli exists and has the right version
lando php -v | grep 5.6.

# Verify the webroot is set correctly
lando ssh appserver -c "env | grep LANDO_WEBROOT=/app/www"

# Verify we have the xdebug extension
lando php -m | grep Xdebug

# Verify the databases was setup correctly
lando ssh database -c "mysql -ulamp -plamp lamp -e\"quit\""

# Verify we have the composer tool
lando composer --version

# Verify we have the mysql cli
lando mysql -V

# Verify our custom php settings
lando php -i | grep memory_limit | grep 513M

# Verify the custom db file was used
lando ssh database -c "mysql -u root -e \'show variables;\' | grep key_buffer_size | grep 4026"
```

Blowup the app
--------------

Run these commands to ensure we clean things up.

```bash
# Destroys the LAMP stack
lando destroy -y
```
