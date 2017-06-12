destroy
=======

Destroys the infrastructure needed to run an app. After you run this command you will not be able to access the app or use Lando tooling for development. The files (eg the git repo) for the app will not be removed.

> #### Info::Only destroys an app, not Lando itself!
>
> This command should not be confused with uninstalling Lando. It **will only** destroy the app that you use it on.

Usage
-----

```bash
# From an app directory or its subdirectories
lando destroy

# From outside of an app directory
lando destroy myapp

# Non-interactive destruction from app directory
lando destroy -y

# Destruction from anywhere in debug mode
lando destroy appname -- -vvv
```

Options
-------

```bash
  --help, -h  Show help                                                [boolean]
  --yes, -y   Auto answer yes to prompts              [boolean] [default: false]
```
