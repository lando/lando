---
title: How to tokenize all your Pantheon projects
metaTitle: How to tokenize all your Pantheon projects | Lando
description: Use a single Pantheon token to authenticate and set and forget
summary: Use a single Pantheon token to authenticate and set and forget
date: 2020-04-14T13:13:42.681Z
original:
repo:

author:
  name: Ed Reel
  pic: https://www.gravatar.com/avatar/f497380919da21a23b0fbfc3e432bd7c
  link: https://twitter.com/twittedreel

feed:
  enable: true
  author:
    - name: Ed Reel
      email: alliance@lando.dev
      link: https://twitter.com/twittedreel
  contributor:
    - name: Ed Reel
      email: alliance@lando.dev
      link: https://twitter.com/twittedreel
---

# How to tokenize all your Pantheon projects

<GuideHeader test="" name="Ed Reel" pic="https://www.gravatar.com/avatar/f497380919da21a23b0fbfc3e432bd7c" link="https://twitter.com/twittedreel" />
<YouTube url="" />

## Overview

Are you frustrated that every Pantheon project in Lando requires a new machine token? If so, then this guide is definitely for you.
Follow the directions below and you will only need to obtain a token once and simply use it again on any Pantheon project. Note that this
assumes all your projects are accessible with the same Pantheon account. If you have another account, you will need to obtain a new token
for that account. The good news is Terminus will save multiple accounts and Lando will let you select which token to use for each project.

## Steps

* Install [Terminus](https://github.com/pantheon-systems/terminus).  Note there are dependencies.

A quick way to install the latest release on Linux/macOS (requires git, curl and php) is shown below:
```bash
$ cd /tmp
$ git clone https://github.com/pantheon-systems/terminus.git
$ cd terminus
$ curl -Lso terminus https://github.com/pantheon-systems/terminus/releases/$(git describe --abbrev=0 --tags)/terminus.phar
$ chmod +x terminus
$ sudo mv terminus /usr/local/bin/
$ cd -
$ rm -rf /tmp/terminus
$ terminus -V
```
* Obtain a [Pantheon machine token](https://pantheon.io/docs/machine-tokens).  The token will be stored in `$HOME/.terminus/cache/tokens/myname@mydomain.tld` (Linux/macOS).
* Create a new or enter an existing Lando project using the [Pantheon recipe](https://docs.lando.dev/config/pantheon.html).
* Start the app with `lando rebuild` and select the email address of the registered token when prompted.

::: warning Don't logout
Note that if you ever `terminus auth:logout`, you will have to repeat the process all over again to obtain a new token.
:::

<GuideFooter test="" original="" repo=""/>
<Newsletter />
