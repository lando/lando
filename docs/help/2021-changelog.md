# 2021

## v3.0.29 - [April 5, 2021](https://github.com/lando/lando/releases/tag/v3.0.29)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* **Fixed longstanding bug causing container to container `*.lndo.site` resolution to differ from proxy-based resolution [#2934](https://github.com/lando/lando/issues/2934), this results in a change of behavior that may impact how your app works in Lando, read more [here](https://docs.lando.dev/config/networking.html#port-considerations)**

* Updated dependencies to be compatible with `node` 14 [#2945](https://github.com/lando/lando/issues/2945) [#2928](https://github.com/lando/lando/issues/2928)

## v3.0.28 - [March 26, 2021](https://github.com/lando/lando/releases/tag/v3.0.28)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Hotfixed `*.lndo.site` going away for `drupaly` recipes [#2934](https://github.com/lando/lando/issues/2934)

## v3.0.27 - [March 25, 2021](https://github.com/lando/lando/releases/tag/v3.0.27)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added experimental `alpha` support for `acquia` recipe [read more](https://docs.lando.dev/config/acquia.html)
* Reverted auto `nvm` sourcing for `platform.sh` recipes in favor of manual `.environment` spec [#2820](https://github.com/lando/lando/issues/2820)
* Set `DOCKER_BUILDKIT=1` to force emulation for now [#2688](https://github.com/lando/lando/issues/2688)
* Set `vm.max_map_count` only if necessary and writable [#2884](https://github.com/lando/lando/issues/2880)
* Switched to use `semver.coerce()` to get a valid semantic version number for PHP. [#2884](https://github.com/lando/lando/issues/2884)

## v3.0.26 - [February 23, 2021](https://github.com/lando/lando/releases/tag/v3.0.26)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added `freetype` to `php` `8.0` `gd` extenstion [#2865](https://github.com/lando/lando/issues/2865)
* Added support for `mariab` `10.5` [#2856](https://github.com/lando/lando/issues/2856)
* Fixed bug preventing `prestissimo` uninstall on alternate format `composer_versions` [#2870](https://github.com/lando/lando/issues/2870)
* Improved Lockr integration so its compatibilty with new Pantheon app structure [#2859](https://github.com/lando/lando/issues/2859)
* Improved availability of `render-template` across `nginx` versions [#2760](https://github.com/lando/lando/issues/2760)
* Improved various UX and docs things
* Updated `mariadb` `10.x` images [#2856](https://github.com/lando/lando/issues/2856)
* Updated `php` `8.0` image to latest `8.0.2` [#2865](https://github.com/lando/lando/issues/2865)

## v3.0.25 - [February 2, 2021](https://github.com/lando/lando/releases/tag/v3.0.25)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added support for `lagoon.type == none` [#2828](https://github.com/lando/lando/issues/2828)
* Added `6.0` to list of supported `redis` versions
* Added "dumb" support for the `drupal9` `pantheon` framework [#2831](https://github.com/lando/lando/issues/2831)
* Fixed bug causing build hook installed `composer` version to not load correctly in `platformsh` recipe [#2826](https://github.com/lando/lando/issues/2826)
* Fixed bug causing `nvm` installed `node` versions to not load correctly in `platformsh` recipe when invoked via tooling [#2820](https://github.com/lando/lando/issues/2820)
* Fixed bug causing `composer` install to fail on `php` `8.0` [#2729](https://github.com/lando/lando/issues/2729)
* Fixed bug causing `port` to not be passed in correctly when authing against custom `lagoon` instance
* Improved `lando pull` for `lagoon` recipes to handle other files directory locations [#2762](https://github.com/lando/lando/issues/2762)
* Improved error message when `lando` cannot detect any `platformsh` applications for `platformsh` recipes [#2822](https://github.com/lando/lando/issues/2822)
* Improved error message when `lando` cannot detect a `lagoon.yml` for `lagoon` recipes [#2818](https://github.com/lando/lando/issues/2818)
* Updated `pantheon` recipe to use `wkhtmltopdf` version `0.12.5` in _most_ `php` images
* Updated `pantheon` recipe to use `terminus` version `2.5.0`
* Updated to Docker Desktop `3.1.0` and provided wider future patch support because https://github.com/docker/roadmap/issues/183
