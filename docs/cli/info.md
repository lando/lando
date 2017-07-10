info
====

Displays relevant information for an app. Using this command you can see useful information such as which container volumes are being shared, which database ports are exposed (both internally and externally), and which URLs you can use to access an app.

Usage
-----

```bash
# From an app directory or its subdirectories
lando info

# From outside of an app directory
lando info myapp
```

Options
-------

```bash
  --deep, -d  Get ALL the info                        [boolean] [default: false]
```
