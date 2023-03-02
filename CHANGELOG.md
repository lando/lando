## v3.14.0 - [March 1, 2023](https://github.com/lando/lando/releases/tag/3.14.0)

### CLI

* Updated to `lando/cli` version [`3.14`](https://github.com/lando/cli/releases/tag/v3.14.0)

### Plugins

* Updated to `@lando/backdrop` version [`0.8.0`](https://github.com/lando/backdrop/releases/tag/v0.8.0)
* Updated to `@lando/core` version [`3.14.0`](https://github.com/lando/core/releases/tag/v3.14.0)
* Updated to `@lando/drupal` version [`0.8.0`](https://github.com/lando/drupal/releases/tag/v0.8.0)
* Updated to `@lando/joomla` version [`0.8.0`](https://github.com/lando/node/releases/tag/v0.8.0)
* Updated to `@lando/laravel` version [`0.8.0`](https://github.com/lando/laravel/releases/tag/v0.8.0)
* Updated to `@lando/node` version [`0.8.1`](https://github.com/lando/node/releases/tag/v0.8.1)
* Updated to `@lando/pantheon` version [`0.9.0`](https://github.com/lando/pantheon/releases/tag/v0.9.0)
* Updated to `@lando/symfony` version [`0.8.0`](https://github.com/lando/symfony/releases/tag/v0.8.0)
* Updated to `@lando/wordpress` version [`0.8.0`](https://github.com/lando/wordpress/releases/tag/v0.8.0)

## Notes

This pre-release is a bit more experimental than most pre-releases. It implements a new URL `scanner` that

* Provides real time updates on the status of services URLS
* Has a new `path` option so you can configure a different path besides `/` to scan
* Has a new `timeout` option so you can configure the time to wait for a response from your service
* Has a new `retry` option so you can configure the amount of retries the scanning does per service
* Has a new `okCodes` option so you can configure additional code eg `404` that should pass the scanner

See more here: https://docs.lando.dev/core/v3/scanner.html
Report scanner errors here: https://github.com/lando/lando/issues

### Special

* [2022 Review](https://lando.dev/blog/2023/01/23/review-of-2022.html)
* [2023 Roadmap](https://lando.dev/blog/2023/01/23/roadmap-of-2023.html)
* [Pi release](https://www.youtube.com/watch?v=OjyZKfdwlng)

## v3.11.0 - [January 27, 2023](https://github.com/lando/lando/releases/tag/3.11.0)

### Installer

#### Windows

* Fixed bug with `features` detection failing for users not using `en-US` [#3490](https://github.com/lando/lando/issues/3490)
* Switched from `MsgBox` to `SuppressibleMsgBox` [#3504](https://github.com/lando/lando/pull/3504)

### CLI

* Updated to `lando/cli` version [`3.11`](https://github.com/lando/cli/releases/tag/v3.11.0)

### Plugins

* Updated to `@lando/core` version [`3.10.0`](https://github.com/lando/core/releases/tag/v3.10.0)
* Updated to `@lando/node` version [`0.8.0`](https://github.com/lando/node/releases/tag/v0.8.0)

## Special

* [Extended release notes](https://lando.dev/blog/2023/01/19/v390-extended.html)
* [2022 Review](https://lando.dev/blog/2023/01/23/review-of-2022.html)
* [2023 Roadmap](https://lando.dev/blog/2023/01/23/roadmap-of-2023.html)
* [Down, down](https://www.youtube.com/watch?v=lYBIRHi5-o8)

## v3.10.0 - [January 23, 2023](https://github.com/lando/lando/releases/tag/3.10.0)

This release is the same as [3.9.1](https://github.com/lando/lando/releases/tag/v3.9.1) but is bumped so we can flag it as the "latest" release

A lot has happened since our last stable release so we encourage you to read:

* [Extended release notes](https://lando.dev/blog/2023/01/19/v390-extended.html)
* [2022 Review](https://lando.dev/blog/2023/01/23/review-of-2022.html)
* [2023 Roadmap](https://lando.dev/blog/2023/01/23/roadmap-of-2023.html)

## v3.9.1 - [January 20, 2023](https://github.com/lando/lando/releases/tag/v3.9.1)

### Installer

* Updated to [Docker Desktop 4.16.2](https://docs.docker.com/desktop/release-notes/#4162)

### CLI

* Updated to `@lando/cli` version [`3.9.1`](https://github.com/lando/cli/releases/tag/v3.9.1)

### Plugins

* Updated to `@lando/core` version [`3.8.5`](https://github.com/lando/core/releases/tag/v3.8.5)

### Misc

* Some [additional notes](https://lando.dev/blog/2023/01/19/v390-extended.html) worth reading 😄

## v3.9.0 - [January 18, 2023](https://github.com/lando/lando/releases/tag/v3.9.0)

### Installer

* Updated to [Docker Desktop 4.16.1](https://docs.docker.com/desktop/release-notes/#4161)

### CLI

* Added a `--debug` flag
* Improved `bin/lando.js` entrypoint to properly "minstrap" before it hands off to the correct runtime

### Plugins

* Updated to `@lando/core` version [`3.8.4`](https://github.com/lando/core/releases/tag/v3.8.4)
* Updated to `@lando/php` version [`0.7.1`](https://github.com/lando/php/releases/tag/v0.7.1)

## v3.8.1 - [December 24, 2022](https://github.com/lando/php/releases/tag/3.8.1)

### Installer

#### macOS

* Fixed issue with `x64` not translating to `x86_64` correctly, causing architecture mismatch failure [#3487](https://github.com/lando/lando/issues/3487)

## v3.8.0 - [December 19, 2022](https://github.com/lando/php/releases/tag/3.8.0)

### Installer

#### macOS

* Updated to [Docker Desktop 4.15.0](https://docs.docker.com/desktop/release-notes/#4150)
* Updated to new Lando 4 branding
* Improved Docker Desktop installation logic, Lando will now only install Docker Desktop if it doesn't exist or is behind
* Improved UX around Docker Desktop installation
* Improved UX around architecture mismatches

#### Windows

* Updated to [Docker Desktop 4.15.0](https://docs.docker.com/desktop/release-notes/#4150)
* Updated to new Lando 4 branding
* Improved Docker Desktop installation logic, Lando will now only install Docker Desktop if it doesn't exist or is behind
* Improved UX around Docker Desktop installation
* Improved UX around architecture mismatches
* Switched to use `wsl2` backend by default instead of `hyper-v1`

### CLI

* Updated to `@lando/cli` version [`3.8.1`](https://github.com/lando/cli/releases/tag/v3.8.1)

### Core

* Updated to `@lando/core` version [`3.8.2`](https://github.com/lando/core/releases/tag/v3.8.2)

### Plugins

* Updated to `@lando/acquia` version [`0.7.0`](https://github.com/lando/acquia/releases/tag/v0.7.0)
* Updated to `@lando/apache` version [`0.7.0`](https://github.com/lando/apache/releases/tag/v0.7.0)
* Updated to `@lando/backdrop` version [`0.7.0`](https://github.com/lando/backdrop/releases/tag/v0.7.0)
* Updated to `@lando/compose` version [`0.7.0`](https://github.com/lando/compose/releases/tag/v0.7.0)
* Updated to `@lando/dotnet` version [`0.7.2`](https://github.com/lando/dotnet/releases/tag/v0.7.2)
* Updated to `@lando/drupal` version [`0.7.0`](https://github.com/lando/drupal/releases/tag/v0.7.0)
* Updated to `@lando/elasticsearch` version [`0.7.0`](https://github.com/lando/elasticsearch/releases/tag/v0.7.0)
* Updated to `@lando/go` version [`0.7.0`](https://github.com/lando/go/releases/tag/v0.7.0)
* Updated to `@lando/joomla` version [`0.7.0`](https://github.com/lando/joomla/releases/tag/v0.7.0)
* Updated to `@lando/lagoon` version [`0.7.0`](https://github.com/lando/lagoon/releases/tag/v0.7.0)
* Updated to `@lando/lamp` version [`0.7.0`](https://github.com/lando/lamp/releases/tag/v0.7.0)
* Updated to `@lando/laravel` version [`0.7.0`](https://github.com/lando/laravel/releases/tag/v0.7.0)
* Updated to `@lando/lemp` version [`0.7.0`](https://github.com/lando/lemp/releases/tag/v0.7.0)
* Updated to `@lando/mailhog` version [`0.7.0`](https://github.com/lando/mailhog/releases/tag/v0.7.0)
* Updated to `@lando/mariadb` version [`0.7.0`](https://github.com/lando/mariadb/releases/tag/v0.7.0)
* Updated to `@lando/mean` version [`0.7.0`](https://github.com/lando/mean/releases/tag/v0.7.0)
* Updated to `@lando/memcached` version [`0.7.0`](https://github.com/lando/memcached/releases/tag/v0.7.0)
* Updated to `@lando/mongo` version [`0.7.0`](https://github.com/lando/mongo/releases/tag/v0.7.0)
* Updated to `@lando/mssql` version [`0.7.0`](https://github.com/lando/mssql/releases/tag/v0.7.0)
* Updated to `@lando/mysql` version [`0.7.0`](https://github.com/lando/mysql/releases/tag/v0.7.0)
* Updated to `@lando/nginx` version [`0.7.0`](https://github.com/lando/nginx/releases/tag/v0.7.0)
* Updated to `@lando/node` version [`0.7.0`](https://github.com/lando/node/releases/tag/v0.7.0)
* Updated to `@lando/pantheon` version [`0.7.0`](https://github.com/lando/pantheon/releases/tag/v0.7.0)
* Updated to `@lando/php` version [`0.7.0`](https://github.com/lando/php/releases/tag/v0.7.0)
* Updated to `@lando/phpmyadmin` version [`0.7.0`](https://github.com/lando/phpmyadmin/releases/tag/v0.7.0)
* Updated to `@lando/platformsh` version [`0.7.0`](https://github.com/lando/platformsh/releases/tag/v0.7.0)
* Updated to `@lando/postgres` version [`0.7.0`](https://github.com/lando/postgres/releases/tag/v0.7.0)
* Updated to `@lando/python` version [`0.7.0`](https://github.com/lando/python/releases/tag/v0.7.0)
* Updated to `@lando/redis` version [`0.7.0`](https://github.com/lando/redis/releases/tag/v0.7.0)
* Updated to `@lando/ruby` version [`0.7.0`](https://github.com/lando/ruby/releases/tag/v0.7.0)
* Updated to `@lando/solr` version [`0.7.0`](https://github.com/lando/solr/releases/tag/v0.7.0)
* Updated to `@lando/symfony` version [`0.7.0`](https://github.com/lando/symfony/releases/tag/v0.7.0)
* Updated to `@lando/tomcat` version [`0.7.0`](https://github.com/lando/tomcat/releases/tag/v0.7.0)
* Updated to `@lando/varnish` version [`0.7.0`](https://github.com/lando/varnish/releases/tag/v0.7.0)
* Updated to `@lando/wordpress` version [`0.7.0`](https://github.com/lando/wordpress/releases/tag/v0.7.0)
