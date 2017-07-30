share
=====

Gives the user a publicly accessible url for their app. This is useful for sharing work with clients or testing your local site on multiple devices. By default `share` will use the `appserver` service. If you do not have a defined `appserver` service `share` will use the first service it finds with URLS.

Optionally a user can specify a specific service to get the URL from. This is useful if you want to test an edge service like varnish instead of a webserver directly.

> #### Hint::What are my services called?
>
> Try running `lando info` from inside your app. Any service with listed `urls` should be shareable.

Usage
-----

```bash
# From inside of an app directory, share my site
lando share

# Share the edge service
lando share -s edge
```

Options
-------

```bash
  --service, -s  Share a specific service                 [default: "appserver"]
```
