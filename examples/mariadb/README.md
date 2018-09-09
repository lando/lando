MariaDB Example
===============

This example provides a very basic `mariadb` service.

See the `.lando.yml` in this directory for MariaDB configuration options.

Boot it
-------

Run the following commands to get up and running with this example.

```bash
# Start up the mariadb
lando start
```

Validation Commands
-------------------

Run the following commands to confirm things

```bash
# Verify mariadb portforward
docker inspect mariadb_database_1 | grep HostPort | grep 3307
lando info | grep port | grep 3307

# Verify the correct version is being used
lando ssh database -c "mysql -V | grep 10.1."

# Verify the databases was setup correctly
lando ssh database -c "mysql -umariadb -pmariadb mariadb -e\"quit\""

# Verify the custom config file was used
lando ssh database -c "mysql -u root -e \'show variables;\' | grep key_buffer_size | grep 4404"
```

Destruction
-----------

Run the following commands to clean up

```bash
# Destroy the mariadb
lando destroy -y
```
