# Platform.sh Development Guide

This guide contains information to help onboard developers to work on the [Platform.sh](https://platform.sh) integration, hereafter referred to as "the plugin".

After reading through it the developer should understand:

* The high level goals of the integration
* The general features roadmap
* How the plugin is structured
* How the plugin modifies the usual lando runtime
* How the project is tested
* How additional services/application containers are added
* How additional tooling is added
* Where framework level overrides live
* Contributing code

It may also be valuable to review the [user documentation](https://docs.lando.dev/config/platformsh.html) for this integration as that provides a bit of a Specification as Documentation.

## Overview

The high level goals of the integration are straightforward:

### 1. Use platform.sh images

This allow users to run their platform.sh projects locally using the same images, build processes, configuration, etc as they do on platform.sh itself. This means that a Landofile using the `platformsh` recipe can be be something simple like this:

```yaml
name: lando-d8
recipe: platformsh
config:
  id: 5su5nuuuwr5xg
```

The implication here is that Lando will instead look and use the platform.sh configuration files instead of its own mechanisms. You can, however, still use the Landofile for additional power you may need exclusively in the local context.

### 2. Interact with the remote platform.sh environment

Similarly to our other hosting integrations the user should be able to do _something like_ the following:

```bash
# Authenticate against platform.sh and clone down a project
lando init --source platformsh

# Pull down relationships and mounts
lando pull -r database -m web/sites/default/files

# Push up relationships and mounts
lando push -r database -m web/sites/default/files
```

### 3.Provide relevant tooling commands

Provide access to the `platform` CLI and other contextually relevant commands.

```bash
# Run platform cli commands
lando platform

# Run other things
lando php
lando composer
lando node
lando ruby

# Connect to platform relationships
lando database
lando redis
lando db2
```

### 4. Deploy not-yet-on-platform.sh local projects to platform

Still a bit TBD on how this should work but the user story is something like:

> I am a user that has a site running locally but it is not currently hosted on platform.sh. I want to run a lando command and end up with a site running on platform.sh.

### 5. Get all the other built-in benefits of Lando

RTFM if you need more info on dat.

## Roadmap

The tentative roadmap for acheiving the above is

### 1. Internal Alpha Release (June 2020)

* Something that can be tested internally at Platform.sh and Tandem
* A user should be able to `lando init` their `drupal8` projects and get them running
* Popular Drupal services like `mariadb`, `mysql`, `memcached`, `redis`, `solr`, `postgresql` and `elasticsearch` are expected to work
* `lando pull` and `lando push` are expected to work

These are all expected to be delivered at `alpha` level quality eg the 80/20 rule for use case coverage is probably a good quality threshold.

### 2. Public Beta Release (August 2020)

* Something that can be publicly released at beta level quality
* A user should also be able to run `WordPress`, `Magento`, `eZ Platform` and `node` applications
* Remaining services like `rabbitmq` are expected to work

These are all expected to be delivered at `beta` level quality eg the 90/10 rule for use case coverage is probably a good quality threshold.

### 3. Public RC Release (Winter 2020-2021)

* Improvement to all existing functionality
* Support for other languages and framework TBD

These are all expected to be delivered at `rc` level quality eg the 95/5 rule for use case coverage is probably a good quality threshold.

### 4. Long Term Support (January 2021 - February 2023)

* Bug fixes to existing functionality
* Iterative improvements to existing features eg support for a new php version

### 5. Deploy other local projects

TBD

# Project Structure

A general breakdown of where things live inside the Lando repo is shown below:

```bash
./
|-- .circleci       CircleCi config to run our generated functional tests
|-- .github         Helpful GitHub templates
|-- .platform       Platform.sh config to run our docs site
|-- api             Our express API
|-- bin             CLI entrypoint script
|-- blog            Vuepress blog and its content
|-- docs            Vuepress docs site and its content
|-- events          Vuepress events listing and its content
|-- examples        Examples user in this documentation and to generate functional tests
|-- installer       Installer packages and helpers
|-- lib             Core libraries
|-- metrics         Express metrics server
|-- plugins         Core plugins
|-- scripts         Scripts to help with build, test and deploy automation
|-- test            Unit and functional tests
|-- website         Vuepress marketing site and its content
|-- .lando.yml      The Landofile for Lando
|-- .travis.yml     Travis CI config for POSIX unit tests, build and deploy
|-- config.yml      Default Lando global config
|-- package.json    Lando node dependencies
```
https://docs.lando.dev/contrib/contrib-plugins.html#plugins

## Flow

## Contribution

PR per issue
update docs
etc

## Testing

## Adding Services

## Adding

## Contributing code

