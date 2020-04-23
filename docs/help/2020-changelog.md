# 2020

## v3.0.0-rrc.5 - April 17, 2020 (Estimated Release Date)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added _extremely experimental_, for-testing-purposes-only support for Lagoon Drupal 8 projects, [read more](https://docs.lando.dev/config/lagoon.html)
* Added legacy `SIMPLETEST_` envvars to Drupaly recipes [#1269](https://github.com/lando/lando/pull/1269)
* Added ability for users to control which host `ssh` keys Lando uses [#2031](https://github.com/lando/lando/pull/2031)
* Added reasonable `max-file` and `max-size` limits to services so logs don't grow indefinitely [#1774](https://github.com/lando/lando/pull/1774)
* Changed the default bind address to `127.0.0.1` and made `bindAddress` globally configurable [#2035](https://github.com/lando/lando/pull/2035)
* Fixed bug causing Pantheon `pull` and `push` to fail when checked out to branch that wasnt also a multidev env [#2153](https://github.com/lando/lando/pull/2153)
* Fixed bug causing Pantheon `lando push` to push to unexpected environments [#2153](https://github.com/lando/lando/pull/2153)
* Fixed bug causing `ERR_INVALID_REDIRECT` for some proxied servives [#2149](https://github.com/lando/lando/pull/2149)
* Fixed bug causing app start to fail if proxy was unable to locate suitable ports [#1857](https://github.com/lando/lando/pull/1857)
* Fixed bug causing `ssh` to fail when username or keypaths had spaces in them [#2031](https://github.com/lando/lando/pull/2031)
* Improved spelling and grammar in docs, code and comments, thanks @uberhacker!
* Spell check docs/api/*.md

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-rrc.4 - [April 11, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.4)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added support for `postgres:12` [#2133](https://github.com/lando/lando/pull/2133)
* Added a `lando rebuild` warning if app becomes out of sync with Lando [#2098](https://github.com/lando/lando/pull/2098)
* Added option to configure the `default-authentication-plugin` for `mysql:8` services [#2135](https://github.com/lando/lando/pull/2135)
* Improved "starty" UX to communicate warnings eg "a healthcheck failed" better [#1088](https://github.com/lando/lando/pull/1088)
* Improved app start so it throws helpful instructions when start fails [#2098](https://github.com/lando/lando/pull/2098)
* Improved healthchecks so they no longer consume CPU while idle [#1088](https://github.com/lando/lando/pull/1088)
* Improved `proxy` so it automatically recreates itself when Lando is updated
* Improved `external_connection.host` so it uses `127.0.0.1` instead of `localhost`, this helps situations where the user has `mysql` running over a socket on their host
* Fixed bug causing a custom named `landoFile` and custom pre and post Landofiles to not be recognized correctly #1919](https://github.com/lando/lando/pull/1919)
* Fixed bug causing all multicommand tooling to run as `www-data` instead of the `meUser` eg `node` for node services [#1877](https://github.com/lando/lando/pull/1877)
* Fixed bug causing services built from local Dockerfiles to error when run from subdirectories [#2102](https://github.com/lando/lando/pull/1877)
* Fixed bug causing recipes to not properly identify pullable and locally built services
* Fixed bug causing `lando push --code` to fail if `git` `user.name` or `user.email` are not set [#47](https://github.com/pantheon-systems/localdev-issues/issues/47)
* Set `default-authentication-plugin` to `mysql_native_password` for LAMP MySQL 8 recipes [#2135](https://github.com/lando/lando/pull/2135)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-rrc.3 - [April 2, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.3)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added separate `edge` and `stable` release channels, [read more](https://docs.lando.dev/config/releases.html)
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

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-rrc.2 - [March 25, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.2)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added support for `go` versions `1.12-1.14`,
* Added support for `solr` `8` [#1765](https://github.com/lando/lando/pull/1765)
* Added new `solr` `7` minor versions [#1765](https://github.com/lando/lando/pull/1765)
* Added support for `.mjs` files in `nginx` [#1537](https://github.com/lando/lando/issues/1537)
* Added documentation on how to set `vm.max_map_count` correctly if you cannot run `elasticsearch` correctly [#1967](https://github.com/lando/lando/issues/1967)
* Fixed bug caused by setting `TERMINUS_VERSION` in Pantheon appserver images [#1872](https://github.com/lando/lando/issues/1872)
* Fixed bug causing build steps to not run if app was manually removed [#2079](https://github.com/lando/lando/issues/2079)
* Fixed bug with app name names containing spaces [#1767](https://github.com/lando/lando/issues/1767)
* Fixed bug causing crash on `macOS` if Docker is not installed first
* Fixed bug causing CLI array data to vanish on Windows, thanks @rabauss! [#2063](https://github.com/lando/lando/issues/2063)
* Officially documented file performance `excludes` feature [#763](https://github.com/lando/lando/issues/763) [#1460](https://github.com/lando/lando/issues/1460)
* Updated `go` to use `1.14` as the default version [#2009](https://github.com/lando/lando/issues/2009)
* Updated `phpmyadmin` to use `5.0` as the default version [#2062](https://github.com/lando/lando/issues/2062)
* Upgraded to `terminus` `2.3.0` [#2082](https://github.com/lando/lando/issues/2082)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-rrc.1 - [March 22, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.1)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Downgraded Docker Desktop for Windows to `2.2.0.3` because [#2052](https://github.com/lando/lando/issues/2052) [#2076](https://github.com/lando/lando/issues/2076)
* Switched pre-release series because apparently linux cares [#2072](https://github.com/lando/lando/issues/2072)
* Updated Docker Desktop for macOS installer to handle the 2.1 -> 2.2 upgrade better

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-aft.2 - [March 20, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-aft.2)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added support for `mariadb` `10.4` [#2004](https://github.com/lando/lando/issues/2004)
* Added patch version pinning to `bitnami` based services [#2057](https://github.com/lando/lando/issues/2057)
* Added `rsync` to the `php:7.4` image [#2056](https://github.com/lando/lando/issues/2056)
* Fixed bug causing `--secret-toggle` to break packaged `lando`s
* Fixed bug causing prerelease version comparison produce unexpected results [#2049](https://github.com/lando/lando/issues/2049)
* Fixed breaking upstream change in all `bitnami` based services [#2057](https://github.com/lando/lando/issues/2057)

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-aft.1 - [March 13, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-aft.1)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added signed `windoze` installer and binary [#2037](https://github.com/lando/lando/issues/2037)
* Added support for `node` `12` and `13` [#1866](https://github.com/lando/lando/issues/1866)
* Added support for new `node` `10` and `11` minor versions [#1981](https://github.com/lando/lando/issues/1981)
* Added support for `php` `7.4` [#1891](https://github.com/lando/lando/pull/1892)
* Added `json` and `table` formats to some `lando` commands [#1737](https://github.com/lando/lando/issues/1737)
* Added compatibility for Docker Desktop `2.2.0.4` on macOS and Windows [#1975](https://github.com/lando/lando/issues/1975)
* Fixed bug causing cli output colorization in non `TTY` contexts [#1789](https://github.com/lando/lando/issues/1789)
* Fixed bug causing `memcached` to not boot up correctly [#1827](https://github.com/lando/lando/issues/1827)
* Improved macOS and Windows Lando installers [#1975](https://github.com/lando/lando/issues/1975)
* Improved build step and restart performance [#2013](https://github.com/lando/lando/issues/2013)
* Rebased `lando` on `node` `12` for MOAR SPEEDS [#2037](https://github.com/lando/lando/issues/2037)
* Removed lingering reference to `Git for Windows` in Windoze installer [#1865](https://github.com/lando/lando/issues/1865)
* Updated to `docker-compose` `1.25.4` [#1975](https://github.com/lando/lando/issues/1975)
* Updated to Docker Desktop `2.2.0.4` for macOS and Windows [#1975](https://github.com/lando/lando/issues/1975)
* Updated `xdebug` to latest in `php` `7.2` and `7.3`
* Updated functional tests to use `hyperdrive 0.6.1` [#2037](https://github.com/lando/lando/issues/2037)

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**
