---
title: Overriding a Service Version or Image
metaTitle: Overriding a Service Version | Lando
description: Modify the underlying Docker images used by your Lando services so that you can custom tailor the container environment for your apps!
summary: Modify the underling Docker images used by your Lando services so that you can custom tailor the container environment for your apps!
date: 2020-03-19T19:59:04.806Z
original:
repo:

author:
  name: Dustin LeBlanc
  pic: https://www.gravatar.com/avatar/e61caccbbfd817bc8b52c0395ba888a6
  link: https://twitter.com/DustinLeblanc

feed:
  enable: true
  author:
    - name: Dustin LeBlanc
      email: alliance@lando.dev
      link: https://twitter.com/DustinLeblanc
  contributor:
    - name: Dustin LeBlanc
      email: alliance@lando.dev
      link: https://twitter.com/DustinLeblanc
---

# Overriding a Service Version

<GuideHeader test="" name="Dustin LeBlanc" pic="https://www.gravatar.com/avatar/e61caccbbfd817bc8b52c0395ba888a6" link="https://twitter.com/DustinLeblanc" />

The Docker images Lando uses for services are well optimized for local development, but occasionally you need to
override those images with some of your own secret sauce. Lando makes this easy to do through the services `overrides`
key:

```yaml
name: projectofdoom
recipe: drupal8
config:
  via: nginx
  webroot: web
  php: 7.3
  database: mariadb
  xdebug: true
env_file:
  - .env
services:
  database:
    overrides:
      image: bitnami/mariadb:10.3.27
```

In the example above, we're overriding the image to use an explicit release of Bitnami's MariaDB container to bypass a
breaking change released on Bitnami's 10.3 tag (Lando's default version).

You can also use this to load your own custom images:

```yaml
name: projectofdoom
recipe: drupal8
config:
  via: nginx
  webroot: web
  php: 7.3
  database: mariadb
  xdebug: true
env_file:
  - .env
services:
  appserver:
    overrides:
      image: myamazingorg/fancyappserver:latest
```
<GuideFooter test="" original="" repo=""/>
<Newsletter />
