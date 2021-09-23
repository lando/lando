---
description: Learn how to activate the Lando secret toggle
metaTitle: Activate Secret Toggle | Lando
---

# 3. Activate Secret Toggle

Lando has a secret _contributor mode_ that you need to engage to contrib. To make that happen, complete the sections below:

## Fork and install Lando from source

* If you are not a Lando committer with write access to the [official repo](https://github.com/lando/cli), start by [forking Lando](https://help.github.com/articles/fork-a-repo/).
* Follow the [install from source instructions](./../basics/installation.html#from-source) using either the [official repo](https://github.com/lando/cli) or your fork.
* Clone the https://github.com/lando/lando repo into the same directory. 

## Engage Contrib Mode

* Verify you've installed from source correctly

```bash
# Ensure you have the correct version of node installed
node -v | grep v14. || echo "Wrong node version"

# Ensure you have yarn installed
yarn -v || echo "Yarn not installed"

# Ensure you can run lando.dev
lando.dev
```

* Activate the secret toggle

```bash
# Activate the secret toggle
lando.dev --secret-toggle

# Verify the toggle is on
lando.dev contrib:list || echo "\n\nSecret toggle not on"
```
