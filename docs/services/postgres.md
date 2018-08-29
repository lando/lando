PostgreSQL
==========

[PostgreSQL](https://www.postgresql.org/) is an advanced open source database server. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[10.3](https://hub.docker.com/r/_/postgres/)** **(default)**
*   [10.2](https://hub.docker.com/r/_/postgres/)
*   [10.1](https://hub.docker.com/r/_/postgres/)
*   [10](https://hub.docker.com/r/_/postgres/)
*   [9.6](https://hub.docker.com/r/_/postgres/)
*   [9.5](https://hub.docker.com/r/_/postgres/)
*   [9.4](https://hub.docker.com/r/_/postgres/)
*   [9.3](https://hub.docker.com/r/_/postgres/)
*   custom

> #### Warning::Be Careful Switching Database type, version or credentials
>
> You should be careful switching database types, versions or credentials. In the case of type and version the underlying database files between these things may not be compatible. **Ignoring this warning can cause your database service to not start correctly!!!** In the case of credentials, these are set when the container is **initially created** so in order to change them you need to `lando destroy && lando start`. Note that `lando destroy` will delete all the data in your database.
>
> You can read more about this [here](./../issues/switching-dbs.md)

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/postgres/tags/) are all the tags that are available for this service.

Here is an example of overriding the `nginx` service to use a patched version.

{% codesnippet "./../examples/patchversion/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/patchversion).

Example
-------

{% codesnippet "./../examples/postgres/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/postgres).

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
      "https://localhost:32811",
      "http://localhost:32812",
      "http://postgres.lndo.site",
      "https://postgres.lndo.site"
    ]
  },
  "tswift": {
    "type": "postgres",
    "version": "latest",
    "creds": {
      "user": "trouble",
      "password": "trouble",
      "database": "trouble"
    },
    "internal_connection": {
      "host": "tswift",
      "port": 5432
    },
    "external_connection": {
      "host": "localhost",
      "port": 5444
    }
  }
}
```
