restart
=======

[Stops](./stop.md) and then [starts](./start.md) an app. If you wish to rerun your build or you've altered your `.lando.yml` you should check out [rebuild](./rebuild.md).

> #### Warning::This command no longer invokes any build steps.
>
> Post `3.0.0-rc1` versions of Lando will no longer run **ANY** build steps.

Usage
-----

```bash
# From an app directory or its subdirectories
lando restart

# From outside of an app directory
lando restart myapp
```
