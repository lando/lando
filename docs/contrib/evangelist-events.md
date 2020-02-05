---
description: Learn how to post events to our events listing
metaTitle: Events listing site | Lando
title: Events listing site
---

# Events listing site

We maintain an event listing site over at <https://events.lando.dev> and highly encourage you to post your event there. This is a good way for us to market the event and also get you credit for your contribution.

You can easily add an event using some secret lando commands.

## 1. Damn preliminaries

You will need to go through all the steps in our [Getting Involved](contributing) section if you have not done so already. This will get you rolling for contribution. Here are all the steps from the aforementioned section for completeness.

1. [Join the alliance](./join.md)
2. [Join the comms](./comms.md)
3. [Install Lando from source and activate secret toggle](./activate.md)
4. [Add yourself as a contributor](./first.md)
5. [Process to adding your first guide](./guides-add.md)

If you are having issues with any of the above or need some guidance from one of our guide pros make sure you [join our Slack org](https://launchpass.com/devwithlando) and check out the **#community** and/or **#evangelists** channels.

## 2. Create a new branch


```bash
# Make sure you are on an updated master
git checkout master
git pull origin master

# Checkout a new branch for your contribution
git checkout -b addMyEvent
```

## 3. Add the new event

```bash
# Follow and answer the interactive prompts
lando.dev event:add

# Verify it's been added
lando.dev event:list

# Remove if want to start over
lando.dev event:remove
```

## 4. Commit, push and PR

```bash
# Add content, commit and push
git add .
git commit -m "The best lando preso ever"
git push origin addMyEvent
```

And then [open a pull request](https://help.github.com/articles/creating-a-pull-request/).
