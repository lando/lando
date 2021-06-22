---
title: How do I configure a Lando Recipe?
metaTitle: How do I configure a Lando Recipe? | Lando
description: Using the lando config key to configure your recipe.
date: 2020-02-04T18:00:18.702Z
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

# How do I configure a Lando Recipe?

<GuideHeader name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" test="https://github.com/lando/cli/tree/main/examples/lamp"/>

When you first initialize a lando app (`lando init`) you get a very simple `.lando.yml` configuration file. Here is the `.lando.yml` file for the LAMP recipe.

```yaml
name: mylamp
recipe: lamp
config:
  webroot: .
```

By using the `config` key in the `lando.yml` file you can configure aspects of your app to say match the production instance. For example say your production server
is using PHP 5.6; you can set that under the `config` key like so:

```yaml
name: mylamp
recipe: lamp
config:
  webroot: .
  php: 5.6
```

Now be sure to `rebuild` your app so that the new changes take effect:

```bash
lando rebuild -y
```

You can check that the change took by using `lando php -v`:

```bash
└─ $ ∴ lando php -v
PHP 5.6.40 (cli) (built: Jan 23 2019 00:10:05) 
Copyright (c) 1997-2016 The PHP Group
Zend Engine v2.6.0, Copyright (c) 1998-2016 Zend Technologies
    with Zend OPcache v7.0.6-dev, Copyright (c) 1999-2016, by Zend Technologies
```

Similarly you can pin down the database backend and version of your app. Say you want MariaDB 10.3:

```yaml
name: mylamp
recipe: lamp
config:
  webroot: .
  php: 5.6
  database: mariadb:10.3
```

Again rebuild for the changes: `lando rebuild -y` and 💥 you now have PHP 5.6 and MariaDB 10.3!

<GuideFooter original="" repo=""/>
<Newsletter />
