# Website

You can contribute to the website by building and previewing it locally. YOu can use either run `yarn` commands or use [lando on lando](https://www.youtube.com/watch?v=STYsEXiuruU).

```bash
# Clone the lando reo
git clone https://github.com/lando/lando.git

# Install its dependencies
cd lando && yarn

# Start with lando
lando start

# Open the site
open https://site.lndo.site

# Build the full website
lando build:site
```

## Without Lando

```bash
# Clone the lando reo
git clone https://github.com/lando/lando.git

# Install its dependencies
cd lando && yarn

# Serve the website for dev
yarn dev:site

# Build the full website
yarn build:site
```
