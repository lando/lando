phpMyAdmin Example
==================

This example provides a very basic `phpmyadmin` example built ontop of the LEMP recipe.

See the `.lando.yml` in this directory for phpMyAdmin configuration options.

Starting the example
--------------------

Run the following commands to get up and running with this example.

```bash
# Start up PMA
lando start
```

Testing the example
-------------------

```bash
# Verify the PMA site is working
lando ssh appserver -c "curl -I pma.lemp.lndo.site | grep 200 | grep OK"

# Verify the databases are up and good
lando ssh database -c "mysql -ulemp -plemp lemp -e\"quit\""
lando ssh database2 -c "mysql -umariadb -ppassword database -e\"quit\""

# Verify our databases are hooked up to PMA
lando ssh pma -c "env | grep PMA_HOSTS=database,database2"
```

Helpful Commands
----------------

Here is a non-exhaustive list of commands that are relevant to this example.

```bash
# Get DB connection info
lando info

# Get URL info for accessing the pma interface
lando info
```

Destroying the examples
-----------------------

Run the following commands to kill this example.

```bash
# Destroy PMA
lando destroy -y
```
