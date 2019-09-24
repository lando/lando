---
description: Learn how to contribute to Lando documentation.
---

# Documentation

You can contribute to docs by clicking on the *Edit Page* link on each page of this documentation. If you want to build and preview documentation locally you can use either run `yarn` commands or use [lando on lando](https://www.youtube.com/watch?v=STYsEXiuruU).

## With Lando

```bash
# Clone the lando reo
git clone https://github.com/lando/lando.git

# Install its dependencies
cd lando && yarn

# Start with lando
lando start

# Open the site
open https://docs.lndo.site

# Build the full docs site
lando build:docs
```

## Without Lando

```bash
# Clone the lando reo
git clone https://github.com/lando/lando.git

# Install its dependencies
cd lando && yarn

# Serve the documentation for dev
yarn dev:docs

# Build the full documentation site
yarn build:docs
```
