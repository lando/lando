rebuild
=======

If you change your `.lando.yml` you'll want to run `lando rebuild` for the changes to take effect. This is also a great command to run if your app has gotten into a bad state and you want to set things right.

Usage
-----

```bash
# From an app directory or its subdirectories
lando rebuild

# From outside of an app directory
lando rebuild myapp

# Non-interactive rebuild from app directory
lando rebuild --yes

# Rebuild from anywhere in info mode
lando rebuild appname -- -v

# Rebuild only the appserver and cache services
# NOTE: This will also trigger build steps for ONLY the specified services
lando rebuild -s cache -s appserver
```

Options
-------

```bash
  --services, -s    Rebuild only the specific services           [array]
  --yes, -y         Auto answer yes to prompts                           [boolean] [default: false]
```
