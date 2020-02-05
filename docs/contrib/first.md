---
description: Learn how to make your first contribution to Lando.
metaTitle: Make your first contribution | Lando
---

# 5. Make First Contribution

Now that you are all setup it's time to make your first contribution. Follow the sections below to add yourself to the [team](./team.html) and learn our workflow.

## Create a new branch

Lando uses a modified [GitHub Flow](https://guides.github.com/introduction/flow/) development model. You can read more about this process in the aforementioned link but the general codeflow is:

```bash
# Make sure you are in the lando source repo
cd /path/to/cloned/lando/source

# Make sure you are on an updated maser
git checkout master
git pull origin master

# Checkout a new branch for your contribution
git checkout -b addContribMe
```

## Add yourself as a contributor

```bash
# Follow and answer the interactive prompts
lando.dev contrib:add

# Verify you've been added
lando.dev contrib:list
```

## Commit and push

```bash
# Add updates, commit and push
git add .
git commit -m "Adding MYSELF to the team"
git push origin addContribMe
```

## Open a Pull Request

[Open a pull request](https://help.github.com/articles/creating-a-pull-request/).
