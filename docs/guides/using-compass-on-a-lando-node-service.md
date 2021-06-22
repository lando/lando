---
title: Using Compass on a Lando Node Service
metaTitle: Using Compass on a Lando Node Service | Lando
description: Learn how to use legacy compass sass builds for your Lando frontend node build
summary: Learn how to use legacy compass sass builds for your Lando frontend node build
date: 2020-05-13T01:27:44.387Z
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

# Using Compass on a Lando Node Service

<GuideHeader test="https://circleci.com/gh/lando/lando/tree/master" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

Some older `node` based frontend build steps rely on `ruby` and `compass`. If you have such a flow we _highly recommend_ you escape dependency hell and migrate your `sass` build steps to use `node-sass` which is _way_ faster.

However, if you cannot do this you may run into some issues running `compass` inside of your `node` container since this pattern is fundamentally at odds with Lando's one-thing-per-container model.

You can, however, get around it by installing `ruby` and `compose` directly in the `node` service that requires them.

Below is an example that installs `ruby` and `compass` using [build-steps](./../config/services.md#build-steps).

```yaml
services:
  myservice:
    type: node:12
    build_as_root:
      - apt-get update -y
      - apt-get install ruby-full -y
      - gem install compass
tooling:
  ruby:
    service: myservice
  compass:
    service: myservice
```

You can verify with:

```bash
lando ruby -v
lando compass -v
```

You should now be able to run any build steps that require `ruby` and `compass` as in this example:

```yaml
services:
  myservice:
    type: node:12
    globals:
      grunt-cli: latest
    build_as_root:
      - apt-get update -y
      - apt-get install ruby-full -y
      - gem install compass
    build:
      - grunt build:sass
tooling:
  ruby:
    service: myservice
  compass:
    service: myservice
```

<GuideFooter test="https://circleci.com/gh/lando/lando/tree/master" original="" repo="https://github.com/lando/cli/tree/main/examples/node12"/>
<Newsletter />
