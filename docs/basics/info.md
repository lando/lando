---
metaTitle: lando info | Lando
description: lando info prints useful information about your app like service connection information and urls.
---

# info

Prints info about your app.

Using this command you can see useful information such as:

* Shared container volumes
* Service versions, exposed ports, hostnames and access credentials
* Custom config file locations
* Other depends-on-which-service relevant things

## Usage

```bash
# Get app info
lando info

# Get super deep info about your app (this runs `docker inspect` under the hood)
lando info --deep

# Get super deep data as json
lando info --deep --format json
```

## Options

```bash
--deep, -d     Get ALL the info
--format       Output in given format: json
--help         Shows lando or delegated command help if applicable
--service, -s  Get info for only the specified services
--verbose, -v  Runs with extra verbosity
--path, -p     Only return the value at the given path
```
