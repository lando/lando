# 2019

## v3.0.0-rc.23 - [November 26, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.23)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.lando.dev/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

* Added process handling and management to `shell.js`
* Added an opt-in for crash and error reporting
* Added sponsorship options to the website and docs [#0](https://lando.dev/sponsor/)
* Added `The Lando Alliance` to the website [#0](https://lando.dev/alliance/join/)
* Added Catalina support via Notarization [#1829](https://github.com/lando/lando/issues/1829)
* Clarified and updated Terms of Use and Privacy Policy
* Fixed `NET::ERR_CERT_INVALID` on Chrome, may require `lando restart` [#1831](https://github.com/lando/lando/issues/1831)
* Improved anonymity of usage reporting
* Improved `metrics` server
* Updated to Docker Desktop 2.1.0.5

## v3.0.0-rc.22 - [October 7, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.22)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.lando.dev/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Updated to Docker Desktop 2.1.0.2/3 for Catalina prep

## v3.0.0-rc.21 - [October 1, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.21)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Fixed upstream bug with `apache` [#1804](https://github.com/lando/lando/issues/1804)
* Fixed upstream bug with `memcached` [#1804](https://github.com/lando/lando/issues/1804)
* Improved documentation search with Algolia [#1756](https://github.com/lando/lando/issues/1756)

## v3.0.0-rc.20 - [August 16, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.20)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added [marketing site](https://lando.dev) [#1410](https://github.com/lando/lando/issues/1410)
* Added ability to [sponsor lando](https://www.patreon.com/join/devwithlando?)
* Added support for patch versions of `elasticsearch` `7.3` [#1729](https://github.com/lando/lando/issues/1729)
* Fixed `mysql` failing on `linux` on `restart` [#1739](https://github.com/lando/lando/issues/1739)
* Updated to Docker Desktop 2.1.0.1 [#1728](https://github.com/lando/lando/issues/1728)
* Updated to `composer` `1.9.0` for `php` `7.1+`
* Updated [documentation site](https://docs.lando.dev) [#1410](https://github.com/lando/lando/issues/1410)

## v3.0.0-rc.19 - [July 31, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.19)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Fixed critical breaking upstream change that prevented the `mysql` service from restarting [#1718](https://github.com/lando/lando/issues/1718)
* Updated to Docker Desktop `2.1.0.0` and `docker-compose` `1.24.1`

## v3.0.0-rc.18 - [July 17, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.18)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added better functional tests for `postgres` [#1663](https://github.com/lando/lando/issues/1663)
* Added support for `elasticsearch:7` [#1672](https://github.com/lando/lando/issues/1672)
* Fixed borked `elasticsearch` service caused by breaking upstream change in `bitnami/elasticsearch` [#1561](https://github.com/lando/lando/issues/1561) [#1672](https://github.com/lando/lando/issues/1672)
* Fixed borked `mongo` service caused by breaking upstream change in `bitnami/mongodb` [#1674](https://github.com/lando/lando/issues/1674)
* Fixed bug preventing changeds to custom `solr` config from showing up after `lando restart` [#1557](https://github.com/lando/lando/issues/1557)
* Pinned our `php` images to use `stretch` [#1680](https://github.com/lando/lando/issues/1680)
* Updated default `psql` client to match our default `postgres` version `(10)` [#1680](https://github.com/lando/lando/issues/1680)
* Updated `backdrop` `drush` to `1.0.0`

## v3.0.0-rc.17 - [May 24, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.17)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Fixed broken `lando share` command [#1582](https://github.com/lando/lando/issues/1582)
* Fixed breaking upstream change in `apache` service
* Fixed breaking upstream change in `postgres` service [#1612](https://github.com/lando/lando/issues/1612)
* Updated `backdrop` `drush` to `0.1.1`

## v3.0.0-rc.16 - [May 10, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.16)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added a `php` `7.3` appserver container to `pantheon` recipes [#1595](https://github.com/lando/lando/issues/1595)
* Added better feedback after `lando --clear` [#1572](https://github.com/lando/lando/issues/1572)
* Added a duplicate CA Cert ending in `crt` for greater compatibility [#1550](https://github.com/lando/lando/issues/1550)
* Added support for `mariadb` `10.3` [#1603](https://github.com/lando/lando/issues/1603)
* Fixed bug causing custom `engineConfig.certPath` to fail with `ReferenceError: path is not defined` [#1571](https://github.com/lando/lando/issues/1571)
* Fixed bug causing ssh keys to not load if one key had a filename with a space in it [#1593](https://github.com/lando/lando/issues/1593)
* Fixed bug causing Linux installer to fail when `/proc/sys/vm/max_map_count` does not exist [#1586](https://github.com/lando/lando/issues/1586)
* Rebased `php` images on `stretch` where applicable [#1554](https://github.com/lando/lando/issues/1554)
* Suppressed `terminus` update warning [#1551](https://github.com/lando/lando/issues/1551)
* Updated `source` lists for `php` images still running on `jessie` [#1554](https://github.com/lando/lando/issues/1554)
* Updated `drush` defaults to latest versions [#1543](https://github.com/lando/lando/issues/1543)
* Updated `terminus` to version `2.0.1` [#1551](https://github.com/lando/lando/issues/1551)

## v3.0.0-rc.15 - [April 23, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.15)

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* This release has no content or changes. It's meant to repopulate S3 assets.

## v3.0.0-rc.14 - [March 18, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.14)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added `phantomjs` `1.7.0` to `pantheon` recipes [#1507](https://github.com/lando/lando/issues/1507)
* Documented ability to set custom `vhosts` and `server` config for `php` services and `laempy` recipes [#1523](https://github.com/lando/lando/issues/1523)
* Fixed `mount denied` error on Windows when using hyperdrived directories [#1510](https://github.com/lando/lando/issues/1510)
* Fixed incorrectly set `PYTHONUSERBASE` [#1519](https://github.com/lando/lando/issues/1519)
* Fixed `destroy` events so they actually get loaded on a `lando destroy` [#1531](https://github.com/lando/lando/issues/1531)
* Fixed `pre-rebuild` event [#1531](https://github.com/lando/lando/issues/1531)
* Improved permission handling for hyperdrived directories

## v3.0.0-rc.13 - [March 1, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.13)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added option for `lando info|config|list` etc to be outputted as JSON [#1455](https://github.com/lando/lando/issues/1455)
* Added support for `sport` to `node` services [#1375](https://github.com/lando/lando/issues/1375)
* Added support for `php` `7.3` [#1342](https://github.com/lando/lando/issues/1342)
* Fixed bug causing `~` to not resolve correctly in overridden volumes [#1483](https://github.com/lando/lando/issues/1483)
* Fixed bug causing internal `*_nginx` services to not inherit overrides from their generating services [#1487](https://github.com/lando/lando/issues/1487)
* Fixed regression causing Pantheon Solr `index` service to not boot up correctly [#1491](https://github.com/lando/lando/issues/1491)
* Injected coaxium directly into the hyperdrive motivator [#1460](https://github.com/lando/lando/issues/1460) [#763](https://github.com/lando/lando/issues/763)
* Improved `macOS` uninstaller text to alert user of potential lingering config and containers [#1495](https://github.com/lando/lando/issues/1495)
* Reduced lando logs max file size to something more reasonable
* Updated `composer` to version `1.8.4` [#1375](https://github.com/lando/lando/issues/1375) [#1488](https://github.com/lando/lando/issues/1488)
* Updated `docker` to version `2.0.0.3/18.09.2` [#1375](https://github.com/lando/lando/issues/1375)

## v3.0.0-rc.12 - [February 20, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.12)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added `<<` and `>>` to list of `SHELL` auto-wrapped characters in tooling/events/build commands
* Fixed `machine token` persistence for `pantheon` apps that are `git cloned` instead of `lando init` [#1475](https://github.com/lando/lando/issues/1475)
* Fixed regression causing `pantheon` `nginx` config to not load correctly

## v3.0.0-rc.11 - [February 20, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.11)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Fixed critical regression causing default recipe config files not to load correctly [#1478](https://github.com/lando/lando/issues/1478)

## v3.0.0-rc.10 - [February 14, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.10)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Bumped `varnish` `workspace_client` limit to `128k`
* Described URL changes in the upgrade guide [#1445](https://github.com/lando/lando/issues/1445)
* Fixed default database config loading in `LAMPY` recipes [#1454](https://github.com/lando/lando/issues/1454)
* Fixed dynamic tooling routes not setting the correct event service default
* Improved `solr` start up script naming and mounting, _probably_ fixes [#1442](https://github.com/lando/lando/issues/1442)
* Removed unneeded `git` dependency from Linux packages, fixes [#1437](https://github.com/lando/lando/issues/1437)

## v3.0.0-rc.9 - [Febraury 8, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.9)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added support for backdrop drush `0.1.0` release.
* Deprecated `--help` in favor of "smarter" `--help` [#1325](https://github.com/lando/lando/issues/1325)
* Improved `php` `$_ENV` population, fixes [#1429](https://github.com/lando/lando/issues/1429)
* Improved support for `build.context` in `compose` services [#1432](https://github.com/lando/lando/issues/1432)
* Improved `drush` healthcheck to be decoupled from apps [#1325](https://github.com/lando/lando/issues/1325)
* Removed legacy Kalabox code still hanging around, fixes [#1431](https://github.com/lando/lando/issues/1431)

## v3.0.0-rc.8 - [Febraury 7, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.8)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added support to run outside of port `80` for `dotnet` services [#1325](https://github.com/lando/lando/issues/1325)
* Added `lockr` support for `pantheon` recipes [#651](https://github.com/lando/lando/issues/651)
* Fixed schema posting issue on Pantheon Solr `index` service [#1348](https://github.com/lando/lando/issues/1348)
* Fixed regression causing named volumes to not mount properly in `compose` services [#1422](https://github.com/lando/lando/issues/1422)
* Improved `TTY` detection and passthru, fixes [#904](https://github.com/lando/lando/issues/904)

## v3.0.0-rc.7 - [Febraury 6, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.7)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added ability to turn off URL scanning on a per-service level [#1207](https://github.com/lando/lando/issues/1207)
* Added `--all`, `--app` and `--filter` flags to `lando list` [#1325](https://github.com/lando/lando/issues/1325)
* Added `--field` flag for `lando config` [#1325](https://github.com/lando/lando/issues/1325)
* Added support for relative paths to `compose` service [#1415](https://github.com/lando/lando/issues/1415)
* Improved auto `wp search-replace` in `pantheon` recipes [#1409](https://github.com/lando/lando/issues/1409)

## v3.0.0-rc.6 - [Febraury 5, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.6)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Fixed regression causing Pantheon Solr index to incorrectly set user perms [#1405](https://github.com/lando/lando/issues/1405)
* Fixed bug requiring Pantheon Solr index be restarted before schema post [#1325](https://github.com/lando/lando/issues/1325)
* Fixed bug where `--help` and `--version` were routing to lando instead of tooling commands [#1407](https://github.com/lando/lando/issues/1407)
* Fixed regression causing `db-export` to fail on `linux` [#1394](https://github.com/lando/lando/issues/1394)

## v3.0.0-rc.5 - [Febraury 4, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.5)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Fixed regression setting `CACHE_PORT` for `pantheon` recipes [#1396](https://github.com/lando/lando/issues/1396)
* Switched all `bitnami` images to set `LANDO_NEEDS_EXEC`

## v3.0.0-rc.4 - [Febraury 4, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.4)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added support for htaccess overrides for Apache [#999](https://github.com/lando/lando/issues/999)
* Added a `LANDO_HOST_USER` envvar [#1082](https://github.com/lando/lando/issues/1082)
* Changed `ssh` key loading to also load passphrase protected keys by default [#1288](https://github.com/lando/lando/issues/1288) [#1143](https://github.com/lando/lando/issues/1143) [#808](https://github.com/lando/lando/issues/808)
* Changed default `http_resp_hdr_len` for `varnish` to `64000` [#1142](https://github.com/lando/lando/issues/1142)
* Fixed bug where files `rsync`ed from Pantheon were being set to `750` [#1325](https://github.com/lando/lando/issues/1325) [#1067](https://github.com/lando/lando/issues/1067) [#1330](https://github.com/lando/lando/issues/1330)
* Fixed longstanding permissions bug with legacy `solr` version `3.6` [#692](https://github.com/lando/lando/issues/692)
* Fixed bug where not-owned-by-me `.ssh` config was blowing up `ssh` key loading [#1203](https://github.com/lando/lando/issues/1203)
* Fixed bug causing `mysql`, `mariadb` and `postgres` services to intermittently crash on `lando restart` [#1381](https://github.com/lando/lando/issues/1381)
* Fixed regression in `events` caused by "multi word" tooling eg `command [something]`
* Fixed regression in `lando logs --service SERVICE` not actually filtering [#1386](https://github.com/lando/lando/issues/1386)
* Improved `ssh` key loading to use the `LANDO_HOST_USER` by default [#1082](https://github.com/lando/lando/issues/1082)
* Improved handling when an unknown service is used with the `proxy` [#1389](https://github.com/lando/lando/issues/1389)

## v3.0.0-rc.3 - [Febraury 3, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.3)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU READ THE BELOW IF YOU ARE UPDATING FROM PRE RC2**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Fixed `postgres` config loading preventing outside connections [#1379](https://github.com/lando/lando/issues/1379)
* Fixed busted auto-naming on Windows deploy [#1375](https://github.com/lando/lando/issues/1375)
* Fixed busted `drush` global-local handoff on Pantheon [#1375](https://github.com/lando/lando/issues/1375)
* Fixed regression in `LANDO_INFO` causing services to be index values instead of names [#1376](https://github.com/lando/lando/issues/1376)
* Fixed regression causing databases to report as unhealthy after a restart [#1381](https://github.com/lando/lando/issues/1381)
* Improved tooling is-service-already-running delegation [#1378](https://github.com/lando/lando/issues/1378)

## v3.0.0-rc.2 - [Febraury 1, 2019](https://github.com/lando/lando/releases/tag/v3.0.0-rc.2)

### PLEASE PLEASE PLEASE FOR THE LOVE OF ALL THINGS THAT ARE HOLY AND GOOD READ THE BELOW BEFORE PROCEEDING!!!

**WHILE WE'VE TRIED TO MAINTAIN BACKWARDS COMPATIBILITY WE RECOMMEND YOU:**

1. [CHECK OUT THE BIG CHANGES](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) IN RC.2!
2. USE [THIS GUIDE](https://docs.devwithlando.io/guides/updating-to-rc2.html) TO UPDATE YOUR LANDOFILES

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.devwithlando.io/**

* Added `inquirer-autocomplete-prompt` to select inquirer prompts [#1017](https://github.com/lando/lando/issues/1017)
* Added configurable support for `pre` and `post` `.lando.*.yml` source files eg `.lando.[#local|dist].yml` [#759](https://github.com/lando/lando/pulls/759) [#1154](https://github.com/lando/lando/pulls/1154)
* Added support for `elasticsearch` `6` [#1114](https://github.com/lando/lando/pulls/1114)
* Added support for multiple, user-defined `env` files [#994](https://github.com/lando/lando/pulls/994) [#1045](https://github.com/lando/lando/pulls/1045) [#1265](https://github.com/lando/lando/pulls/1265) [#1242](https://github.com/lando/lando/pulls/1242)
* Added support for `ruby` `2.5` [#1068](https://github.com/lando/lando/pulls/1068)
* Added `pcntl` extension to all PHP images [#910](https://github.com/lando/lando/pulls/910)
* Added `leia` to help keep `lando` the real hero we all know he is [#1296](https://github.com/lando/lando/issues/1296)
* Added a better message if users arrive at an "impossible" place [#1158](https://github.com/lando/lando/issues/1158)
* Bumped `xdebug.max_nesting_level` to `512` [#1094](https://github.com/lando/lando/issues/1094)
* Changed `rebuild` events to fire on the outside [#1352](https://github.com/lando/lando/issues/1352)
* Changed `xdebug: false` to actually disable the `php` extension [#760](https://github.com/lando/lando/issues/760)
* Changed update warning to print to `stderr` [#1000](https://github.com/lando/lando/issues/1000)
* Changed `wordpress` recipe to download `wp-cli` version `1.5.1` if using php 5.3 [#1334](https://github.com/lando/lando/issues/1334)
* Changed PHP to have unlimited memory for CLI ops [#732](https://github.com/lando/lando/issues/732)
* Fixed tooling on Windows to not always run as root [#1362](https://github.com/lando/lando/issues/1362)
* Fixed annoying recoverable php error `Cannot set 'user' save handler by ini_set()` on php 7.2 [#747](https://github.com/lando/lando/issues/747)
* Fixed long-standing race condition causing build fail perimission errors on `linux` [#1227](https://github.com/lando/lando/issues/1227) [#1197](https://github.com/lando/lando/issues/1197) [#1170](https://github.com/lando/lando/issues/1170)
* Fixed bug where `docker-compose` files were not loading correctly outside of the app root [#1007](https://github.com/lando/lando/issues/1007)
* Fixed bug where `node` services were not getting the `gid` correctly on `linux` [#1240](https://github.com/lando/lando/issues/1240)
* Fixed bug where cyclical `app -> app` symlink was being create in `pantheon` recipes [#1043](https://github.com/lando/lando/issues/1043)
* Fixed various `solr` config bugs [#1249](https://github.com/lando/lando/issues/1249) [#1350](https://github.com/lando/lando/issues/1350) [#1319](https://github.com/lando/lando/issues/1319) [#1351](https://github.com/lando/lando/issues/1351)
* Increased events `maxListeners` to `64` [#1097](https://github.com/lando/lando/issues/1097)
* Improved `drush` handling, fixes [#1315](https://github.com/lando/lando/issues/1315) [#1317](https://github.com/lando/lando/issues/1317) [#1318](https://github.com/lando/lando/issues/1318)
* Removed `lando` "global options", fixes [#1173](https://github.com/lando/lando/issues/1173)
* Upgraded `terminus` to version `1.9.0` [#1259](https://github.com/lando/lando/issues/1259)
* Upgraded `docker` to version `18.09.0/2.0.0.2` [#1297](https://github.com/lando/lando/issues/1297) [#1316](https://github.com/lando/lando/issues/1316)
* Upgraded `docker-compose` to version `1.23.2` [#1297](https://github.com/lando/lando/issues/1297) [#1316](https://github.com/lando/lando/issues/1316)
