---
title: Lando Tooling
metaTitle: Lando Proxy | Lando
description: An example of adding tooling to a Lando app.
summary: An example of adding tooling to your Lando app. 
date: 2020-09-05T14:38:22.169Z
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

# Lando Tooling

<GuideHeader test="https://github.com/lando/lando/blob/master/examples/lando-101/README.md" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

Lando provides context specific tooling for the provided recipes, for example, the `lando-101` app is using the `lamp` recipe and out of the box provides us with tooling commands for `php` cli, `composer`, and a `mysql` shell among others. You can see the available commands for any given Lando app by typing `lando` at your command prompt.

Sometimes we might need or want to add our own tooling to a Lando app to simplify workflows, use in CI, and reduce documentation. Let's add a `phpcs` tooling command to our Lando 101 app.

First lets use the Lando provided `composer` tooling to add `phpcs` to our Lando 101 app:

```bash
lando composer require squizlabs/php_codesniffer
```

That will place the `phpcs` binary in `/app/vendor/bin/phpcs` and we'll use that path to expose the tooling to our Lando 101 app.

Open up your `.lando.yml` config file in your favorite text editor:

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
tooling:
  phpcs:
    service: appserver
    cmd: /app/vendor/bin/phpcs
```

The new part of our config is the `tooling` key under which we have nested the command we want to expose, `phpcs` in this case. Told Lando which service to run the tooling command against with `service: appserver`. Provided the `cmd: /app/vendor/bin/phpcs` to tell Lando what command to run under the hood.

Now all the developers on our team for the Lando 101 app can code sniff their code to provide uniform standards across the project. For example, if you want to check the syntax of the `index.php` file; you do so like this:

```bash
lando phpcs index.php
```

Adding the `phpcs` command is simple, but just one example of the types of tooling you can add to your apps. To take a deep dive and learn more about Lando tooling read the [tooling docs page](/config/tooling.html).

<GuideFooter test="" original="" repo=""/>
<Newsletter />
