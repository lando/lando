---
description: Learn how to contribute to the Lando vuepress documentation.
metaTitle: Working on the Lando vuepress documentation | Lando
---

# Documentation

This assumes you've gone through all the steps in our [Getting Involved](contributing) docs and are familiar with contributing.

### Using Lando (recommended)

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Get everything installed and launch core services
lando.dev start

# Start up the docs
lando.dev docs

# Open the docs
open https://docs.lndo.site
```

### Using Yarn

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Use yarn to launch the docs
yarn dev:docs

# Open the docs
open http://localhost:8008
```
