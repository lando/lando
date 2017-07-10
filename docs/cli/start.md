start
=====

Starts an app. This will build all relevant containers needed to run the app.

> #### Hint::Containers are cached!
>
> If you start an app with a new service or container it will need to pull that container image down. This can take a moment depending on your internet connection. Subsequent pulls to that container or service are cached so they should be much faster.

Usage
-----

```bash
# From an app directory or its subdirectories
lando start

# From outside of an app directory
lando start myapp
```
