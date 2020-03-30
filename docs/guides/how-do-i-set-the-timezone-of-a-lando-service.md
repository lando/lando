---
title: How do I set the timezone of a Lando service?
metaTitle: How do I set the timezone of a Lando service? | Lando
description: Set the timezone of a Lando service for testing time sensitive operations
summary: Set the timezone of a Lando service for testing time sensitive operations
date: 2020-03-27T22:30:09.777Z
original: 
repo: 

author:
  name: Geoff St. Pierre
  pic: https://www.gravatar.com/avatar/e103c2a2a8f8caf5848b38b80422cdd9
  link: https://twitter.com/serundeputy

feed:
  enable: true
  author:
    - name: Geoff St. Pierre
      email: alliance@lando.dev
      link: https://twitter.com/serundeputy
  contributor:
    - name: Geoff St. Pierre
      email: alliance@lando.dev
      link: https://twitter.com/serundeputy
---

# How do I set the timezone of a Lando service?

<GuideHeader test="https://github.com/lando/lando/blob/master/examples/php/README.md" name="Geoff St. Pierre" pic="https://www.gravatar.com/avatar/e103c2a2a8f8caf5848b38b80422cdd9" link="https://twitter.com/serundeputy" />

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

Then run a rebuild:

```bash
lando rebuild -y
```

and you'll have the timezone set in those services.

<GuideFooter original="" repo=""/>
<Newsletter />
