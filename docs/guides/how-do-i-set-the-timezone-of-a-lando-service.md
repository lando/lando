---
title: How do I set the timezone of a Lando service?
metaTitle: How do I set the timezone of a Lando service? | Lando
description: Set the timezone of a Lando service for testing time sensitive operations
summary: Set the timezone of a Lando service for testing time sensitive operations
date: 2020-03-27T22:30:09.777Z
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

# How do I set the timezone of a Lando service?

<GuideHeader test="https://github.com/lando/cli/tree/main/examples/services" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />

<YouTube url="https://www.youtube.com/embed/P8n2z4m0_s0" />

If you need to set the timezone of a Lando service here is how! Just symlink the appropriate timezone you need in a `run_as_root` build step. Here is an example `.lando.yml` file.

```yaml
name: timezone
recipe: lemp
config:
  webroot: .

services:
  appserver:
    run_as_root:
      - ln -snf /usr/share/zoneinfo/America/New_York /etc/localtime
      - echo "America/New_York" > /etc/timezone
```

Just copy the `run_as_root` section into your `services` key for any service you need it for, i.e. `appserver`, `database`, or whatever service you need to set. Be sure to swap out `America/New_York` to the timezone that you need.

::: warning Tested on Debian only
Note that we test this on Debian flavored services so these instructions might differ slightly or be unapplicable for non-Debian services.
:::

Then run a rebuild:

```bash
lando rebuild -y
```

and you'll have the timezone set in those services.

<GuideFooter original="" repo=""/>
<Newsletter />
