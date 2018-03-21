Building
========

You can easily build Lando from source with our helpful `yarn` scripts.

> #### Info::Cross compiling is not currently supported
>
> Due to an upstream restriction imposed on us by [pkg](https://github.com/zeit/pkg) we cannot currently cross compile.

```bash
# Build the Lando CLI binary
yarn run pkg:cli
cd dist/cli

# Build the Lando installer.
# This will build the installer for your current platform.
yarn run pkg:full
cd dist
```
