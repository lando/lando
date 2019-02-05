start
=====

Starts an app.

On first run this will build all relevant containers needed to run the app. On subsequent runs it will simply start the built containers.

> #### Hint::Containers are cached!
>
> If you start an app with a new service or container it will need to pull that container image down. This can take a moment depending on your internet connection. Subsequent pulls to that container or service are cached so they should be much faster.

Usage
-----

```bash
lando start
```

Options
-------

```bash
--clear        Clears the lando tasks cache
--lando        Show help for lando-based options
--verbose, -v  Runs with extra verbosity
```
