---
description: Learn how to make your first contribution to Lando.
metaTitle: Make your first contribution | Lando
---

# 4. Make First Contribution

Now that you are all set up, it's time to make your first contribution. Follow the sections below to add yourself to the [team](./team.html) and learn our workflow.

## Recommended workflow

### Create a new branch

Lando uses a modified [GitHub Flow](https://guides.github.com/introduction/flow/) development model. You can read more about this process in the aforementioned link but the general code flow is as follows:

```bash
# Make sure you are in the Lando cli source repo
cd /path/to/cloned/cli


# Make sure you are on the updated main branch
git checkout main
git pull origin main

# Checkout a new branch for your contribution
git checkout -b addContribMe
```

### Add yourself as a contributor

```bash
# Follow and answer the interactive prompts
lando.dev contrib:add

# Verify you've been added
lando.dev contrib:list
```

### Commit and push

```bash
# Add updates, commit and push
git add .
git commit -m "Adding MYSELF to the team"
git push origin addContribMe
```

### Open a Pull Request

[Open a pull request](https://help.github.com/articles/creating-a-pull-request/).

## Manual workflow

If the recommended workflow above is not working for you, then you still have a few options. **We definitely don't prefer these since they require work on our end.**

### Directly edit

Try editing the [contributor database](https://github.com/lando/lando/blob/main/contributors.yml) directly. If you are not sure how to do that then consult [these docs](https://help.github.com/en/github/managing-files-in-a-repository/editing-files-in-your-repository).

You will want to add an entry like below:

```yaml
- name: Mike Pirog
  role:
    - Content
    - Outreach
  bio: >-
    I'm the inventor of Lando and a co-founder @ <a
    href="https://thinktandem.io" target="_blank">Tandem</a>.
  location: New England / Siberia
  github: pirog
  twitter: pirogcommamike
  title: Benevolent Dictator
  pic: 'https://www.gravatar.com/avatar/dc1322b3ddd0ef682862d7f281c821bb'
  id: 0374ef006c170c19a0fddcf006415d548058e1f7
```

### Submit an issue

If even the above is not sufficient, then [open an issue](https://github.com/lando/lando/issues/new/choose) on GitHub.

