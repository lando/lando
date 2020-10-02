---
description: Learn how to add a Lando guide or tutorial
metaTitle: Adding a guide to Lando | Lando
---

# Adding a guide

Now that you are [all set up](./guides-intro.md#what-do-i-need-to-get-started), it's time to make your first guide. Follow the steps below!

::: warning Make sure you activate Secret Toggle!!!
These docs assume you've [installed Lando from source](./activate.md), [toggled its Secret Toggle](./activate.md), [added yourself as a contributor](./first.md) and generally gotten up to speed with [contributing in general](./contributing.md).
:::

## 1. Start Docs Locally

While technically optional, it's a good idea to get the documentation up and running locally. You can do this either with Lando itself or with `yarn` directly if running Lando on Lando is a little too meta for your tastes.

### Using Lando (recommended)

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Get everything installed and launch core services
lando.dev start

# Launch the docs
lando.dev docs

# Open the docs
open https://docs.lndo.site/guides/lando-info.html
```

### Using Yarn

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Use yarn to launch the docs
yarn dev:docs

# Open the docs
open http://localhost:8008/guides/lando-info.html
```

## 2. Create a new branch


```bash
# Make sure you are on an updated master
git checkout master
git pull origin master

# Checkout a new branch for your contribution
git checkout -b addMyGuide
```

## 3. Scaffold out a new guide

```bash
# Follow and answer the interactive prompts
lando.dev guide:generate
```

::: tip DEMO CONTENT
Lando will provide some demo content in the guide you create. Check it out!
:::

## 4. Make your guide

Load the guide Lando created for you in your editor of choice and modify it until its good to go.

Note that if you've got the docs site running locally, it will hot reload your guide as you edit it. This should help you see what your content will look like when it's on the actual site.

## 5. Commit, push and PR

```bash
# Add content, commit and push
git add .
git commit -m "Guide on how to do something awesome"
git push origin addMyGuide
```

And then [open a pull request](https://help.github.com/articles/creating-a-pull-request/).
