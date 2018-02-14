Shipping
========

If you are a maintainer of Lando you can kick off an official release using our handy `grunt` tasks.

```bash
# Do a prerelease ie bump 0.0.0-beta.x
yarn release:pre --dry-run
yarn release:pre

# Do a patch release ie bump 0.0.x
yarn release:patch --dry-run
yarn release:patch

# Do a minor release ie bump 0.x.0
yarn release:minor --dry-run
yarn release:minor
```
