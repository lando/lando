---
title: What's new in Lando 3.0.0-rrc.3
metaTitle: What's new in Lando 3.0.0-rrc.3 | Lando
description: We've added release channels, an experimental flag, Pantheon improvements a Docker update and various bug fixes
date: 2020-04-03
original:

author: Mike Pirog
pic: https://www.gravatar.com/avatar/dc1322b3ddd0ef682862d7f281c821bb
link: https://twitter.com/pirogcommamike
location: Undisclosed Location

tags:
- lando

feed:
  enable: true
  author:
    - name: Mike Pirog
      email: alliance@lando.dev
      link: https://twitter.com/pirogcommamike
  contributor:
    - name: Mike Pirog
      email: alliance@lando.dev
      link: https://twitter.com/pirogcommamike
---

As we continue to march towards our official release on May 4, 2020 we wanted to keep you up to date with some of the changes we are making along the way. Here are the highlights for 3.0.0-rrc.3.

## 1. Release channels and change throttling

One of the bigger challenges we've run into since we crossed the 10K user threshold has been delivering updates, new features and bug fixes while minimizing regressions and breaking changes. This challenge is particularly difficult for software like Lando with dependencies that by their nature are moving targets. Development and technology never stop changing!

Of course this challenge is further compounded by the limited time and resources [(cough SPONSOR LANDO cough)](https://lando.dev/sponsor/) we have to work on Lando, which is, afterall, free and open source software. Traditionally we've relied heavily on feedback from power users to help us test new releases. At scale, however, this model begins to break down as power users become an increasing minority and other users, who have a higher expectation for stability, become more commonplace. To address this bifurcation we are introducing [Release Channels](https://docs.lando.dev/config/releases.html) so that users can opt in to a velocity of change that makes sense for them.

The `tl;dr` there is if you want to try out the bleeding edge and help us with bug reports and feedback then `lando --channel edge` from `3.0.0-rrc.3` or higher. If you'd rather opt for a safer road then do nothing because that is the default. If you'd like to get even more bleeding edge you can also `lando --experimental` and opt into mostly-still-in-development features.

If you'd like to learn more then check out our official docs on [release channels](https://docs.lando.dev/config/releases.html) and [experimental mode](https://docs.lando.dev/config/experimental.html).

## 2. Docker updates

If you've struggled with the latest Docker Desktop 2.2 series, particularly on Windows then you [aren't alone](https://github.com/docker/for-win/issues/5530). We've been monitoring these upstream dependencies closely and are rolling new Lando releases, like this one, when important fixes are released.

Yesterday Docker rolled out Docker Desktop 2.2.0.5 which fixes [a bunch of file sharing](https://docs.docker.com/docker-for-windows/release-notes/#docker-desktop-community-2205) related issues on Windows. It's included with Lando 3.0.0-rrc.3.

## 3. The sun sets on `lando share`, for now

Lando has long given you publicly accessible URLs for any of your locally running sites with `lando share`. Generally this has been used to  share your work with others and test on mobile devices. Under the hood we've been able to offer this for free by leveraging [localtunnels](https://github.com/localtunnel/localtunnel) free public service. Sadly, this service is no longer available and the project is no longer maintained.

In the near future we will likely document a way to use `ngroks` free service with Lando. This should provide a similar experience to what was previously available in Lando but will require some additional setup on the users end.

We are also working on our own sharing solution that will be more feature-rich and available to all Lando sponsors. This way we can provide more value to our sponsors, cover the costs of the service and provide a better, faster and easier way for our users to share their sites. And of course, your sponsorship dollars will also go towards helping us make Lando even better.

If you'd like to get a head start on that we recommend [you sponsor now](https://lando.dev/sponsor/).

## 4. Pantheon integration improvements

We've taken the first step on a refresh of our [Pantheon](https://pantheon.io) integration. Expect more in the upcoming releases. The highlights here are:

* Lando will now check out your `pantheon.yml` and use the version of Drush you've indicated there down to Drush 8.
* We've updated to Terminus `2.3.0`, Drush 8 to `8.3.2`, Composer to `1.10.1`, these all require a `lando rebuild` on existing apps to get.
* You now can see a complete list of your sites on `lando init`, previously this was capped at around `270` sites

## 5. Other changes

I'd definitely like to mention the Lando `proxy` now supports subdirectories. This is a super cool new feature contributed by [@bartlangelaan](https://github.com/bartlangelaan) that enables you to do something like:

```yaml
proxy:
  appserver:
    - name.lndo.site
  api:
    - name.lndo.site/api
  admin:
    - name.lndo.site/admin/portal
```

And, here are the full release notes for 3.0.0-rrc.3:

* Added an `experimental` flag so users can access bleeding edge features, [read more](https://docs.lando.dev/config/experimental.html)
* Added `PATH_INFO` and `PATH_TRANSLATED` to the default `nginx` `fastcgi_params` [#1987](https://github.com/lando/lando/pull/1987)
* Added `webp` support to `php 7` images [#1715](https://github.com/lando/lando/pull/1715)
* Added subdirectory support to the `proxy` [#1824](https://github.com/lando/lando/pull/1824)
* Added support for `pantheon.yml`'s' `drush_version`
* Increased limit on amount of sites we can get from the Pantheon API [#988](https://github.com/lando/lando/pull/988)
* Fixed bug where `PATH_INFO` was not set in the `pantheon` recipe [#1987](https://github.com/lando/lando/pull/1987)
* Fixed bug causing a silent error when trying to `lando pull --code test|live` using `pantheon` recipe [#2021](https://github.com/lando/lando/pull/2021)
* Fixed bug causing Windows path separators to cause SQL Import/Export scripts to fail [#1823](https://github.com/lando/lando/issues/1823)
* Fixed bug causing `--host` flag using `=` to produce unexpected results on `db-import/export` [#2007](https://github.com/lando/lando/pull/2007)
* Improved `lando db-import` and `lando db-export` to allow absolute paths [#1768](https://github.com/lando/lando/pull/1768)
* Improved feedback from `lando db-import` and `lando db-export` commands [#2027](https://github.com/lando/lando/pull/2027)
* Improved tooling `stdio` configurability and `stderr` discovery [#2021](https://github.com/lando/lando/pull/2021)
* Readded previous `phpmyadmin` `4.x` versions for better backwards compatibility [#2062](https://github.com/lando/lando/pull/2062)
* Set `COMPOSER_MEMORY_LIMIT` to '-1'
* Updated to `composer` version `1.10.1` [#2096](https://github.com/lando/lando/pull/2096)
* Updated to latest `xdebug` in `php` version `7.4` [#2099](https://github.com/lando/lando/pull/2099)
* Updated `drush 8` to `8.3.2` [#2097](https://github.com/lando/lando/pull/2097)
* Updated to Docker Desktop `2.2.0.5` [#2052](https://github.com/lando/lando/pull/2052) [#2122](https://github.com/lando/lando/pull/2122)

## 6. Coming up

We're currently planning to release `3.0.0-rrc.5` on April, 24th with an intermediate release of `3.0.0-rrc.4` somewhere in between now and then based on necessity. We also will bump the current `3.0.0-rrc.3` `edge` release to `stable` sometime next week if it hits our stability threshold. Beyond that we are looking to work on

* [All the issues in this milestone, subject to change](https://github.com/lando/lando/milestone/32)
* Some initial work on our announced integration with [amazee.io's](https://www.amazee.io/) [Lagoon](https://www.amazee.io/lagoon)
* Some initial work on a still-to-be-announced integration with another great hosting _platform_

That's the update!


