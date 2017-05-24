Building
========

You can easily build Lando from source with our helpful `grunt` tasks.

> #### Info::Cross compiling is not currently supported
>
> Due to an upstream restriction imposed on us by [enclosejs](http://enclosejs.com/) we cannot currently cross compile.

```bash
# Build the Lando CLI binary
grunt pkg:cli
cd dist/cli

# Build the Lando installer
grunt pkg
cd dist
```
