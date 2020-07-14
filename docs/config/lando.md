---
description: The Landofile is at the heart of every Lando app but it itself can also be customized. Learn how to set a base configuration or override it on a per user basis.
---

# Landofile

A `.lando.yml` file is at the heart of every Lando app. It is needed to tell Lando what things your app needs for development. It usually will contain the services and tools needed to run and develop your app. This file should live in the root directory of your app's code repository and ideally be tracked in its version control system.

If you make changes to your `.lando.yml`, you will need to `lando rebuild` your app for those changes to be applied.

::: tip You're low, go high
This documentation is specifically about configuring the Landofile itself. If you are interested in a more high level view of what the Landofile can do and its purpose then check out our [Lando introduction](./../basics/).
:::

[[toc]]

## Base File

If you are developing a project start state or have a set of Lando configurations you'd like to ship with all your projects, you can use a "base" file with defaults that can then be overridden by your usual `.lando.yml`. By default, Lando will detect automatically and load before your `.lando.yml` any of the files as follows:

```bash
.lando.base.yml
.lando.dist.yml
.lando.upstream.yml
```

## Override File

On the flip side, you might have some user-specific configuration you'd like to use **on only your computer**. For these situations, Lando similarly offers an "override" file that will be loaded **AFTER** all base files and your `.lando.yml`. Generally you will want to `.gitignore` this file.

```bash
.lando.local.yml
```

## Configuration

The base override and Landofile itself are all configurable via the Lando [global config](./global.md). The default values are shown below:

```yaml
landoFile: .lando.yml
preLandoFiles:
  - .lando.base.yml
  - .lando.dist.yml
  - .lando.upstream.yml
postLandoFiles:
  - .lando.local.yml
```
