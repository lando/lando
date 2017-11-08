Environment
===========

Default Variables
-----------------

While you can add additional environment variables on a per service basis (see [Advanced Service Configuration](./advanced.md)), or globally using a `.env` file (see [Environment File](#environment-file)) Lando will inject some common and helpful environment variables into each service.

These are also helpful in your `.lando.yml` file.

```bash
LANDO=ON
LANDO_APP_NAME=myapp
LANDO_APP_ROOT=/path/to/app/on/my/host
LANDO_SERVICE_TYPE=nginx
LANDO_HOST_UID=501
LANDO_HOST_GID=20
LANDO_HOST_IP=192.68.56.1
LANDO_SERVICE_NAME=appserver
LANDO_HOST_OS=darwin
LANDO_MOUNT=/path/to/your/approot

# The below may be overriden on a per-service basis
LANDO_WEBROOT_USER=www-data
LANDO_WEBROOT_GROUP=www-data
LANDO_WEBROOT_UID=33
LANDO_WEBROOT_GID=33
```

It will also make the following available **ON YOUR HOST MACHINE** so that you can use them in your `.lando.yml` file.

```bash
LANDO_APP_NAME=myapp
LANDO_APP_ROOT=/path/to/app/on/my/host
LANDO_APP_ROOT_BIND=/path/to/app/in/container
```

Environment File
----------------

If you drop a `.env` file into the root directory of your app Lando will automatically inject the variables into all your services. This is particularly useful if you want

1. To inject sensitive credentials into the environment (a la the 12-factor app model)
2. Store credentials in a `.gitignored` file that is not committed to the repo
3. Set config on a per environment basis

That file will generally take the form below.

```yaml
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```
Per User Global ENV VARS
------------------------

If you need vars injected into the containers of all your lando apps you can
drop a `.global_env` file into your `~/.lando/` directory.  In the case that
there is a collision in variable names in `~/.lando/.global_env` and `.env` the
app local `.env` file wins, i.e. the local `.env` file can ovrerride the
`~/.lando/.global_env` file.

The syntax for the `~/.lando/.global_env` file is the same:

```yaml
DRUSH_ALIAS_SSH_USER=memow
```
