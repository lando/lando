---
title: Installing PHP Extensions on Lando
metaTitle: Installing PHP Extensions on Lando | Lando
description: Learn a few ways you can install extra php extensions to your Lando PHP service
summary: Learn a few ways you can install extra php extensions to your Lando PHP service
date: 2020-05-12T16:52:31.824Z
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

# Installing PHP Extensions on Lando

<GuideHeader test="https://circleci.com/gh/lando/lando/tree/master" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

You may wish to add additional PHP extensions to your Lando [PHP service](./../config/php.md). There are a few different ways you can do this:

[[toc]]

Note that both of these strategies make use of underlying utilities provided by the [Official Docker PHP Image]() which is the base image used by Lando's PHP service. We recommend you read more about them [over on their docs](https://hub.docker.com/_/php).

Also note that you may need to adapt these slightly depending on the PHP version you are using.

## 1. Using build steps

If installing your PHP extension is fairly trivial and not a long-running operation you may wish to simply use Lando [build-steps](./../config/services.md#build-steps)

Here is an example that uses build-steps to install the `xsl` and `stats` extensions.

```yaml
services:
  myservice:
    type: php
    build_as_root:
      - apt-get update -y
      - apt install libxslt1-dev -y
      - pecl install stats-2.0.3
      - docker-php-ext-install xsl
      - docker-php-ext-enable stats
```

You can verify the extension was enabled by running:

```bash
lando ssh -s myservice -c "php -m"
```

A downside of this approach is these steps till run _EVERY TIME_ you do a `lando rebuild`.

## 2. Using Dockerfiles

If you have complex, lengthy or long running build steps you may wish to create a `Dockerfile` in your repo that directly extends one of [Lando's PHP images](https://hub.docker.com/r/devwithlando/php/tags).

This approach is great if you care about rebuild speed. Docker will cache the resultant image and only rebuild if the Dockerfile changes. By extension this means your `lando rebuild` will be pretty fast as well.

It also ensures your Landofile does not get unruly.

Here is an example that installs the `oci8` and `pdo_sqlsrv` extension.

**.lando.yml**

```yaml
services:
  myservice:
    type: php:custom
    overrides:
      image: lando/php:7.3-custom
      build:
        context: ./
        dockerfile: Dockerfile.custom
      ports:
        - "80"
```

**Dockerfile.custom**

```docker
FROM devwithlando/php:7.3-apache-2

# Add php extension helper
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install Oracle Instantclient, OCI8 and Microsoft SQL Server extensions
RUN chmod +x /usr/local/bin/install-php-extensions && sync && \
  install-php-extensions oci8-2.2.0 sqlsrv pdo_sqlsrv
```

You can verify the extension was enabled by running

```bash
lando ssh -s myservice -c "php -m"
```

<GuideFooter test="https://circleci.com/gh/lando/lando/tree/master" original="" repo="https://github.com/lando/lando/tree/master/examples/php-extensions"/>
<Newsletter />
