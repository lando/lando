rebuild
=======

Rebuilds the containers and tooling for your app. This command is great for developing, tweaking or updating your app but **should be used with caution**.

> #### Warning::Be careful using this command!
>
> Most app services allow data to persist between rebuilds but there are some services where a rebuild will result in a loss of data.


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
```

Options
-------

```bash
  --help, -h  Show help                                                [boolean]
  --yes, -y   Auto answer yes to prompts              [boolean] [default: false]
```
