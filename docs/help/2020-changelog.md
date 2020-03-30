# 2020

## v3.0.0-rrc.3 - April 3, 2020 (Estimated Release Date)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added separate `edge` and `stable` release channels, [read more](https://docs.lando.dev/config/releases.html)
* Added an `experimental` flag so users can access bleeding edge features, [read more](https://docs.lando.dev/config/experimental.html)
* Added convenience non-breaking backwards compatibility for previous `phpmyadmin` `4.x` versions [#2062](https://github.com/lando/lando/pull/2062)
* Updated to `composer` version `1.10.1` [#2096](https://github.com/lando/lando/pull/2096)
* Updated to latest `xdebug` in `php` version `7.4` [#2099](https://github.com/lando/lando/pull/2099)
* Updated `drush 8` to `8.3.2` [#2097](https://github.com/lando/lando/pull/2097)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

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
* Upgraded to `terminus` `2.3.0` [#2062](https://github.com/lando/lando/issues/2062)

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
* Removed lingering reference to `Git for Windows` in Windoze intaller [#1865](https://github.com/lando/lando/issues/1865)
* Updated to `docker-compose` `1.25.4` [#1975](https://github.com/lando/lando/issues/1975)
* Updated to Docker Desktop `2.2.0.4` for macOS and Windows [#1975](https://github.com/lando/lando/issues/1975)
* Updated `xdebug` to latest in `php` `7.2` and `7.3`
* Updated functional tests to use `hyperdrive 0.6.1` [#2037](https://github.com/lando/lando/issues/2037)

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**
