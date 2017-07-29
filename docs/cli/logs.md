logs
====

Prints out the logs for your app. You can optionally filter by a particular service,
show timestamps for follow the logs a la `tail -f`

Usage
-----

```bash
# From an app directory or its subdirectories
lando logs

# From outside of an app directory
lando logs myapp

# Follow the logs and show timestampls
lando logs -t -f

# Show logs for only the database and cache services
lando logs -s cache -s database
```

Options
-------

```bash
  --follow, -f      Follow the logs                   [boolean] [default: false]
  --services, -s    Show logs for the specified services only            [array]
  --timestamps, -t  Show log timestamps               [boolean] [default: false]
```
