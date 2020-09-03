---
title: Lando Proxy
metaTitle: Lando Proxy | Lando
description: An example of using the Lando proxy key. 
summary: An example of adding the a proxy URL to a Lando service.
date: 2020-09-04T14:38:22.169Z
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

# Lando Proxy

<GuideHeader test="https://github.com/lando/lando/blob/master/examples/lando-101/README.md" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

Some `services` like `mailhog` provide an admin interface via a browser. In such cases it is convenient to assign a URL to the service container. We do so via the `proxy` key in our `.lando.yml` file.

Let's add a URL to our `mailhog` service so we can access the MailHog dashboard. Open up your Lando 101 `.lando.yml` file and add a proxy section like so:

```yaml
name: lando-101
recipe: lamp
config:
  php: 7.4
services:
  mailhog:
    type: mailhog:v1.0.0
    portforward: true
    hogfrom:
      - appserver
proxy:
  mailhog:
    - mail.lando-101.lndo.site
```

The new config being the `proxy` key which takes a `service` and the `service` gets an array of URLs in this case `- mail.lando-101.lndo.site`. You can add a URL to any service you like.

::: warning Rebuild Required
After adding a `proxy` make sure to `rebuild` the Lando 101 app.

```bash
lando rebuild -y
```
:::

After rebuilding we can now access the new `mail.lando-101.lndo.site` URL to view the MailHog dashboard.

<img src="/images/lando-101/mh.jpg" />

Using the `proxy` key in our `.lando.yml` file we can add a URL to any `service` in a Lando app! If you need to dig deeper you can find the read the [full proxy documentatioin](/config/proxy.html).

<GuideFooter test="" original="" repo=""/>
<Newsletter />
