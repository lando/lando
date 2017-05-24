Shipping
========

If you are an administrator of the Lando repo you can kick off an official release using our handy `grunt` tasks.

```bash
# Do a prerelease ie bump 0.0.0-beta.x
grunt prerelease --dry-run
grunt prerelease

# Do a patch release ie bump 0.0.x
grunt release --dry-run
grunt release

# Do a minor release ie bump 0.x.0
grunt bigrelease --dry-run
grunt bigrelease
```
