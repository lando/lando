---
description: Learn how to add lando blog content
metaTitle: Adding a post to the Lando blog | Lando
---

# Adding blog content

Now that you are [all set up](./guides-intro.md#what-do-i-need-to-get-started), it's time to make your first guide. Follow the steps below:

::: warning Make sure you activate Secret Toggle!!!
These docs assume you've [installed Lando from source](./activate.md), [toggled its Secret Toggle](./activate.md), [added yourself as a contributor](./first.md) and generally gotten up to speed with [contributing in general](./contributing.md)
:::

## 1. Start Docs Locally

While technically optional, it's a good idea to get the blog up and running locally. You can do this either with Lando itself or with `yarn` directly if running Lando on Lando is a little too meta for your tastes.

### Using Lando (recommended)

```bash
# Go into the lando source directory
cd /path/to/lando/source

# Get everything installed and launch core services
lando.dev start

# Launch the blog
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

## 2. Create a new branch

```bash
# Make sure you are on an updated master
git checkout master
git pull origin master

# Checkout a new branch for your contribution
git checkout -b addMyPost
```

## 3. Scaffold out a new post

```bash
# Follow and answer the interactive prompts
lando.dev blog:generate
```

::: tip DEMO CONTENT
Lando will provide some demo content in the post you create. Check it out!
:::

## 4. Craft your content

Load the post Lando created for you in your editor of choice and modify it until it's good to go.

Note that if you've got the blog site running locally, it will hot reload your guide as you edit it. This should help you see what your content will look like when it's on the actual site.

## 5. Commit, push and PR

```bash
# Add content, commit and push
git add .
git commit -m "Best content ever"
git push origin addMyPost
```

And then [open a pull request](https://help.github.com/articles/creating-a-pull-request/).
