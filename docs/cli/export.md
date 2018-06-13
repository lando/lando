export
======

Allows the user to export the docker compose file of their app.

Optionally a user can give a destination file path to place the file.

Usage
-----

```bash
# Export the docker compose file as docker-compose.yml if you are in the
# directory of your app.
lando export

# Export from any location the docker compose file as docker-compose.yml
# by giving the appname in the shell.
lando export my_project

# Export the docker compose file on any location with your chosen
# filename.
lando export -d /some/location/my_compose_file.yml
```

Options
-------

```bash
  --destination, -d  Give a custom file destination, including a filename.
```
