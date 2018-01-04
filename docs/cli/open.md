open
====

Opens a started app in your default browser. Truly for the lazy among us :)

> #### Hint::Containers are cached!
>
> If you start an app with a new service or container it will need to pull that container image down. This can take a moment depending on your internet connection. Subsequent pulls to that container or service are cached so they should be much faster.

Usage
-----

```bash
# Opens a reasonable guess at your default url
lando open

# Opens a reasonable guess at your default url for the specified app
lando open myapp

# Opens a specific URL
lando open --url https://myapp.lndo.site
lando open myapp --url https://google.com
```
