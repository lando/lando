# 2020

## v3.0.0-rrc.2 - [March 27, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.2)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added support for `phpmyadmin` `5.0` [#2062](https://github.com/lando/lando/issues/2062)
* Added support for `solr` `8` [#1765](https://github.com/lando/lando/pull/1765)
* Added new `solr` `7` minor versions [#1765](https://github.com/lando/lando/pull/1765)
* Added support for `.mjs` files in `nginx` [#1537](https://github.com/lando/lando/issues/1537)
* Fixed bug causing crash on `macOS` if Docker is not installed first
* Fixed bug causing CLI array data to vanish on Windows, thanks @rabauss! [#2063](https://github.com/lando/lando/issues/2063)
* Officially documented file performance `excludes` feature [#763](https://github.com/lando/lando/issues/763) [#1460](https://github.com/lando/lando/issues/1460)

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
