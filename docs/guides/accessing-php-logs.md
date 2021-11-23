---
title: Accessing the PHP Error Logs
metaTitle: Accessing the PHP Error Logs | Lando
description: Learn how to see your PHP error logs in Lando.
summary: Learn how to see your PHP error logs in Lando.
date: 2021-11-23T18:06:56.254Z
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

# Accessing the PHP Error Logs 

<GuideHeader test="https://circleci.com/gh/lando/lando/tree/master" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

Seeing errors coming off a PHP app is usually very easy in Lando:

```bash
lando logs -s appserver -f
```

Because `lando logs` is actually a light wrapper around `docker logs`, you'll notice that you also get general server error messages and other warnings aside from PHP errors. Sometimes it can help to grep the output to isolate PHP-relevant messages:

```bash
lando logs -s appserver -f | grep 'WARNING\|PHP'
```

::: warning If PHP isn't running in "appserver"...
`appserver` is the default service name in most PHP applications on Lando. If you have PHP running in a service with a different name than `appserver`, simply substitute the relevant service name instead of `appserver`.
:::



<GuideFooter test="https://circleci.com/gh/lando/lando/tree/master" original=""/>
<Newsletter />
