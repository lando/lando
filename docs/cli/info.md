info
====

Prints info about your app.

Using this command you can see useful information such as:

* Shared container volumes
* Service versions, exposed ports, hostnames and access credentials
* Custom config file locations
* Other depends-on-which-service relevant things

Usage
-----

```bash
# Get app info
lando info

# Get super deep info about your app (this runs `docker inspect` under the hood)
lando info --deep
```

Options
-------

```bash
--clear        Clears the lando tasks cache
--deep, -d     Get ALL the info
--lando        Show help for lando-based options
--service, -s  Get info for only the specified services
--verbose, -v  Runs with extra verbosity
```
