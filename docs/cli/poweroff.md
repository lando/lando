poweroff
========

Spins down all lando related containers

This is useful if you want to deactive all the containers needed to run Lando. If you have another service that requires usual system resources like ports `80` and `443` this command will free them up.

Usage
-----

```bash
lando poweroff
```

Options
-------

```bash
--clear        Clears the lando tasks cache
--lando        Show help for lando-based options
--verbose, -v  Runs with extra verbosity
```
