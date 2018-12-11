PHP Nginx Services Example
==========================

This example provides a very basic `LEMP` application using Lando services instead of a recipe.

See the `.lando.yml` in this directory for PHP configuration options.

Start me up!
------------

Run the following steps to get up and running with this example.

```bash
# Starts up a LEMP stack using lando services
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
lando php -v | grep 7.1.

# Verify the webroot is set correctly
lando ssh appserver -c "env | grep LANDO_WEBROOT=/app/www"

# Verify we have the xdebug extension
lando php -m | grep Xdebug

# Verify the databases was setup correctly
lando ssh database -c "mysql -umariadb -ppassword database -e\"quit\""

# Verify mysql portforward
docker inspect lemp_database_1 | grep HostPort | grep 3332
lando info | grep port | grep 3332

# Verify we have the composer tool
lando composer --version

# Verify we have the mysql cli and its using mariadb
lando mysql -V | grep MariaDB

# Verify we have the mysql cli and its the right version
lando node -v | grep 6.10

# Verify we have the phplint cli
lando phplint --version

# Verify our custom php settings
lando php -i | grep memory_limit | grep 499M

# Verify the custom db file was used
lando ssh database -c "mysql -u root -e \'show variables;\' | grep key_buffer_size | grep 4026"
```

Blowup the app
--------------

Run these commands to ensure we clean things up.

```bash
# Destroys the LEMP stack
lando destroy -y
```
