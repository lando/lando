---
description: Learn how to post events to our events listing
metaTitle: Events listing site | Lando
title: Events listing site
---

# Events listing site

We maintain an event listing site over at <https://events.lando.dev> and highly encourage you to post your event there. This is a good way for us to market the event and also get you credit for your contribution.

You can easily add an event using some secret lando commands.

## 1. Damn preliminaries

You will need to go through all the steps in our [Getting Involved](contributing) section if you have not done so already. This will get you rolling for contribution. All the steps from the aforementioned section for completeness are shown below:

1. [Join](./comms.md)
2. [Install Lando from source and activate secret toggle](./activate.md)
3. [Add yourself as a contributor](./first.md)
4. [Process to adding your first guide](./guides-add.md)

If you are having issues with any of the above or need some guidance from one of our guide pros, make sure you [join our Slack org](https://launchpass.com/devwithlando) and check out the **#community** and/or **#evangelists** channels.

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

# Remove if you want to start over
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

## 5. Fallbacks

### Directly edit

Try editing the [events database](https://github.com/lando/lando/blob/master/api/data/events.yml) directly. If you are not sure how to do that then consult [these docs](https://help.github.com/en/github/managing-files-in-a-repository/editing-files-in-your-repository).

You will want to add an entry like below:

```yaml
- name: MidCamp 2020
  id: wahteverf
  date: '2020-03-18'
  url: 'https://www.midcamp.org/'
  location: DePaul University
  presenter: Mike Pirog
  type: camp
  presenterPic: 'https://www.gravatar.com/avatar/dc1322b3ddd0ef682862d7f281c821bb'
  presenterLink: 'https://twitter.com/pirogcommamike'
  summary: >-
    Come hang out with Lando project lead Mike Pirog and hear what we've got in
    store for you in 2020! There isn't a session but we will buy you a beer!
```

### Submit an issue

If even the above is not sufficient, then [open an issue](https://github.com/lando/lando/issues/new/choose) on GitHub.

