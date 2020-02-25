---
description: Learn how to contribute to the Lando vuepress blog.
metaTitle: Working on the Lando vuepress blog | Lando
---

# Blog

This assumes you've gone through all the steps in our [Getting Involved](contributing) docs and are familiar with contributing.

### Using Lando (recommended)

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Get everything installed and launch core services
lando.dev start

# Start up the blog
lando.dev blog

# Open the blog
open https://blog.lndo.site
```

### Using Yarn

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Use yarn to launch the blog
yarn dev:blog

# Open the blog
open http://localhost:8007
```
