MariaDB Example
===============


[MariaDB](https://mariadb.org/) is a very common database server which is *EXTREMELY* similar to MySQL but has a guarantee of being open source. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [10.3](https://hub.docker.com/r/_/mariadb/)** **(default)**
*   [10.2](https://hub.docker.com/r/_/mariadb/)
*   [10.1](https://hub.docker.com/r/_/mariadb/)
*   [10.0](https://hub.docker.com/r/_/mariadb/)
*   [5.5](https://hub.docker.com/r/_/mariadb/)
*   custom

> #### Warning::Be Careful Switching Database type, version or credentials
>
> You should be careful switching database types, versions or credentials. In the case of type and version the underlying database files between these things may not be compatible. **Ignoring this warning can cause your database service to not start correctly!!!** In the case of credentials, these are set when the container is **initially created** so in order to change them you need to `lando destroy && lando start`. Note that `lando destroy` will delete all the data in your database.
>
> You can read more about this [here](./../issues/switching-dbs.md)

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/mariadb/tags/) are all the tags that are available for this service.

Example
-------


You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mariadb).

Getting information
-------------------

You can get connection and credential information about your database by running `lando info` from inside your app.

```bash
# Navigate to the app
cd /path/to/app

# Get info (app needs to be running to get this)
lando info

{
  "html": {
    "type": "nginx",
    "version": "latest",
    "urls": [
      "https://localhost:32802",
      "http://localhost:32803",
      "http://mariadb.lndo.site",
      "https://mariadb.lndo.site"
    ]
  },
  "database": {
    "type": "mariadb",
    "version": "10.1",
    "creds": {
      "user": "mariadb",
      "password": "mariadb",
      "database": "mariadb"
    },
    "internal_connection": {
      "host": "database",
      "port": 3306
    },
    "external_connection": {
      "host": "localhost",
      "port": 3307
    }
  }
}
```

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
# Destroy the mariadb
lando destroy -y
```
