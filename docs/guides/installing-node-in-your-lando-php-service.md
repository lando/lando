---
title: Installing node in your Lando PHP service
metaTitle: Installing node in your Lando PHP service | Lando
description: Learn how to install node in a Lando PHP service for things like Pattern Lab or Emulsify
summary: Learn how to install node in a Lando PHP service for things like Pattern Lab or Emulsify
date: 2020-05-12T18:06:56.254Z
original:
repo:

author:
  name: Team Lando
  pic: https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd
  link: https://twitter.com/devwithlando

feed:
  enable: true
  author:
    - name: Team Lando
      email: alliance@lando.dev
      link: https://twitter.com/devwithlando
  contributor:
    - name: Team Lando
      email: alliance@lando.dev
      link: https://twitter.com/devwithlando
---

# Installing node in your Lando PHP service

<GuideHeader test="https://circleci.com/gh/lando/lando/tree/master" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

Some frontend tooling kits like [Emulsify](https://www.drupal.org/project/emulsify_drupal) or [Pattern Lab](https://patternlab.io/) _may_ assume that `composer/php` can invoke `yarn/npm/node` and vice-versa. This pattern, sadly, is fundamentally at odds with Lando's one-thing-per-container model.

You can, however, get around it by installing the needed dependencies directly in the service that requires them.

We've found installing `node` inside a Lando PHP service to generally be the path of least resistance.

## 1. Using build steps

Below is an example that installs `node12` using [build-steps](./../config/services.md#build-steps).

```yaml
services:
  myservice:
    type: php
    build_as_root:
      # Note that you will want to use the script for the major version of node you want to install
      # See: https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions
      - curl -sL https://deb.nodesource.com/setup_12.x | bash -
      - apt-get install -y nodejs
tooling:
  node:
    service: myservice
  npm:
    service: myservice
```

You can verify with:

```bash
lando node -v
lando npm -v
```

## 2. Extending a Dockerfile

If you are planning to extend your service with _additional_ build steps or would like to cache the build steps for a faster `lando rebuild` you should instead consider [extending with a Dockerfile](./../config/services.md#using-dockerfiles) as in the example below:

**.lando.yml**

```yaml
services:
  myservice:
    type: php:custom
    via: cli
    overrides:
      image: lando/php:7.4-with-node12
      build:
        context: ./
        dockerfile: Dockerfile.node
tooling:
  node:
    service: myservice
  npm:
    service: myservice
```

**Dockerfile.node**

```docker
FROM devwithlando/php:7.4-apache-2

# Choose the major node version
ENV NODE_VERSION=12

# Install node
RUN curl -sL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - \
  && apt-get install -y nodejs
```

Again, you can verify with:

```bash
lando node -v
lando npm -v
```


<GuideFooter test="https://circleci.com/gh/lando/lando/tree/master" original="" repo="https://github.com/lando/cli/tree/main/examples/php"/>
<Newsletter />
