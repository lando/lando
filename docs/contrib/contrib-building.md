---
description: Learn how to build and package Lando from source.
---

# Building

You can easily build Lando from source with our helpful `yarn` scripts.

::: warning Cross compiling is not currently supported!
Due to an upstream restriction imposed on us by [pkg](https://github.com/zeit/pkg), we cannot currently cross compile.
:::

```bash
# Build the Lando CLI binary
yarn run pkg:cli
# Navigate to the prebuilt binaries
cd dist/cli

# Build the Lando installer.
yarn run pkg:full
# Navigate to the prebuilt installers
cd dist
```
