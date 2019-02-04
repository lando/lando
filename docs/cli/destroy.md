destroy
=======

Destroys your app.

After you run this command you will not be able to access the app or use Lando tooling for development unless you restart the app. The files (eg the git repo) for the app will not be removed.

> #### Info::Only destroys an app, not Lando itself!
>
> This command should not be confused with uninstalling Lando. It **will only** destroy the app that you use it on.

Usage
-----

```bash
# Interactive destruction
lando destroy

# Non-interactive destruction
lando destroy -y

# Destroy with debug output
lando destroy -vvv

# Get help about the destroy command
lando destroy --lando
```

Options
-------

```bash
--clear        Clears the lando tasks cache
--lando        Show help for lando-based options
--verbose, -v  Runs with extra verbosity
--version      Show version number
--yes, -y      Auto answer yes to prompts
```
