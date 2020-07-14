# Platform.sh Development Guide

This guide contains information to help onboard developers to work on the [Platform.sh](https://platform.sh) integration, hereafter referred to as "the plugin".

After reading through it the developer should understand:

* The high level goals of the integration
* The general features roadmap
* How the plugin is structured
* How the plugin emulates the platform.sh lifecycle
* How the plugin deviates from the platform.sh lifecycle
* How additional services/application containers are added
* How additional tooling is added
* How the project is tested
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

## Project Structure

This plugin follows the same structure as any [Lando plugin](https://docs.lando.dev/contrib/contrib-plugins.html#plugins) but here is an explicit breakdown:

```bash
./
|-- lib             Utilities and helpers, things that can easily be unit tested
|-- recipes
    |-- platformsh  The files to define the `platformsh` recipe and its `init` command
|-- scripts         Helpers scripts that end up /helpers/ inside each container
|-- services        Defines each platform.sh service eg `redis` or `php`
|-- test            Unit tests
|-- types           Defines the type/parent each above service can be
|-- app.js          Modifications to the app runtime
|-- index.js        Modifications to the Lando runtime
```

## Platform.sh container lifecycle

Normally Lando expects containers to undergo a lifecycle like:

1. Pre-start build steps run if applicable
2. Container starts

In `docker-compose` terms this is generally something like:

```bash
# If there are build steps
docker-compose up
docker-compose exec appserver command1
...
docker-compose exec database command3
docker-compose kill

# Start the app
docker-compose up
```

Platform.sh containers have a more complex lifecycle

1. The container is BOOTed
2. The container undergoes a BUILD
3. The container is STARTed
4. The containers are OPENed

There are other assumptions these containers have that are provided by platform.sh's actual orchestration layer. As we do not have that layer available locally we seek to "spoof" some of those things.

Most of these things are handled by a `python` utility called the `platformsh.agent`. There are also useful wrapper scripts, utilities, templates etc that can be found in `/etc/platform` inside each platform.sh container.

Here are some key things to know about each step and what Lando does to change them.

### BOOT

1. BOOT unmounts `/etc/hosts` and `/etc/resolv.conf`. This stops Docker from controlling them so platform can
2. BOOT will setup and prepare any needed directories
3. BOOT will run `runsvdir` on `/etc/services/`
4. BOOT will send a ping to a spoofed RPC agent to mimic what platform expects
5. BOOT will finish by running `/etc/platform/boot`

Lando puts all this logic in `scripts/psh-boot.sh` and uses it for both the `BOOT` and `START` phases by putting it into `/scripts` inside of each container. Lando's entrypoint script will run anything it finds in this directory before it hands off to the "main" process/command. Also note that `/etc/platform/boot` will finish by handing off to `/etc/platform/start`.

Additionally, Lando will run `scripts/psh-recreate-users.sh` before anything else. This script handles host:container permission mapping.

On platform.sh application containers run as `web:x:10000:10000::/app:/bin/bash` and _most_ services run as `app:x:1000:1000::/app:/bin/bash`. However locally we need whatever user is running process 1 to match the host (eg yours) uid and groupid.

### BUILD

The platform.sh BUILD step uses an internal Lando `build` step behind the scenes. This means it:

1. Only runs on the initial `lando start` and subsequent `lando rebuilds`
2. Runs _before_ the container STARTS and before any user-defined build steps

The BUILD step will use `scripts/psh-build.sh`. This has a few differences from Platform

1. BUILD will set `$HOME` to `/var/www` instead of `/app` so build artifacts/caches dont potentially in your git repo
2. BUILD will install the platform CLI first if it needs to
3. BUILD will use `platform local:build` (for now) instead of the underlying `/etc/platform/build`

### START

Start has a similar lifecycle to `BOOT` except that it ends by running `/etc/platform/start` instead of `/etc/platform/boot`.

Once `/etc/platform/start` finishes the main process/command is run. This is `exec init` for all containers. At this point each container should have a main process running and that process shuold be controlling a bunch of other processes eg `php-fpm` and `nginx` in the case of a `php` container.

However, these containers are all "living in the dark" and need to be OPENed so they can both talk to one another and handle requests.

### OPEN

OPEN is the step that most diverges from what Lando expects in that it requires Lando do additional things AFTER an app has started. Usually once an app has started Lando expects its ready to go. This is not the case for platform. Generally the flow that needs to happen here is:

1. Lando needs to OPEN each platform service eg non-application containers
2. Lando needs to collect the output from all these commands together
3. Lando needs to merge in additional data its previously collected such as the IP addresses of services
4. Lando then needs to inject this payload when it OPENs the application containers

Once this has completed each application container will be "open for business" and ready to handle requests. This is also required to set `PLATFORM_RELATIONSHIPS` which is very important so applications can easily connect to services.

Behind the scenes we use the helper script `scripts/psh-open.sh`. We also do the open logic in `app.js` in a `post-start` event.

## /run/config.json

Most of the platform.sh magic comes from a configuration file located in every service at `/run/config.json`. Lando generates and injects this file into each platform.sh container.

It is constructed by combined the platform.sh configuration files eg `.platform.app.yaml`, `services.yaml` etc and some extra things.

## Services and Types

Inside of the `services` folder you will see where we define the Lando service that corresponds to each platform application container and service. Each service can either be a `platform-appserver` or a `plaform-service` and each of these are defined in the `types` folder.

A `platform-appserver` means it is an applicaton container eg a supported platform "langauge" eg a `type` you can define in a `.platform.app.yaml` file.

A `platform-service` means it something that goes in the `services.yaml`

If you want to add support for a new platform service or application container simply add a new one into the `services` folder and make sure you set the `parent` to either `_platformsh_service` or `_platformsh_appserver` as appropriate.

Also note that you will likely need to add it to `getLandoServiceType` which maps a `platform` `type `to a `lando` `type`.
https://github.com/lando/lando/blob/abf0648701b960e49f09bf9e569c83aca727666a/experimental/plugins/lando-platformsh/lib/services.js#L8

## Getting started

It's easiest to develop by spinnning up one of our platform.sh examples:

* [Drupal 8](https://github.com/lando/lando/tree/master/examples/platformsh-drupal8)
* [Kitchen Sink](https://github.com/lando/lando/tree/master/examples/platformsh-kitchensink)

The Drupal 8 example is a good for deving non-services related things eg the stuff Lando provides on top of platform. The Kitchen Sink example is great if you are working on adding support for new application containers and services.

An added benefit of using these examples is you can simultanesouly add functional tests in their README. See the [#testing](Testing) section below for more details.

## Other considerations

Here are a few other useful things to know.

Also recommend reviewing the [Known issues and caveats](https://docs.lando.dev/config/platformsh.html#caveats-and-known-issues) in the user documentation.

### `lando ssh`

In `index.js` you will see that `lando` is overriding the core `lando ssh` command. This serves two main purposes:

1. To select the default `service` to run on. The default service will be set to the closest `.platform.app.yaml` Lando can find. The `name`of the application in that file is also the name of the service.
2. To make sure all `lando ssh` commands are prefixed with `/helpers/psh-exec.sh`

`/helpers/psh-exec.sh` is a helper script that makes sure the user environment is set correctly before commands are run. Primarily this makes sure that `$HOME` is not set to `/app` and that the `PLATFORM_` variables are set before the command is run.

### Application tooling

Similarly in `index.js` all tooling commands are prefixed by `/helpers/psh-exec.sh`

### Troubleshooting Python Source in Platform.sh Containers

When viewing container logs, you may see references to python files like `config.py`.

You will find the python source code in the following directories:
- `/etc/platform`
- `/usr/lib/python2.7/dist-packages/platformsh`

## Testing

Its best to familiarize yourself with how Lando [does testing](https://docs.lando.dev/contrib/contrib-testing.html) in general before proceeding.

### Unit Tests

Generally, unit testable code should be placed in `lib` and then the associated test in `tests` in the form `FILE-BEING-TESTED.spec.js`. Here is an example:


```bash
./
|-- lib
    |-- stuff.js
|-- test
    |-- stuff.spec.js
```

These tests can then be run with `yarn test:unit`.

### Func Tests

Func tests are made by just adding more entries to each examples README. This uses our made-just-for-Lando testing framework [Leia](https://github.com/lando/leia). See below for our current platform.sh tests:

* [Drupal 8](https://github.com/lando/lando/tree/master/examples/platformsh-drupal8)
* [Kitchen Sink](https://github.com/lando/lando/tree/master/examples/platformsh-kitchensink)

These are then run by CircleCI. While you _can_ run all the func test locally this can take a LONG time. If you decide you want to do that we recommend you generate the test files and then invoke the tests for just one example.

```bash
# Generate tests
yarn generate-tests

# Run a single examples tests
yarn mocha --timeout 900000 test/platform-sh-drupal-8-example.func.js
```

## Contribution

WIP but outline is

1. GitHub flow as normal eg branch for an issue -> PR -> merge
2. Lets review all platformsh PRs together for awhile: this should keep us on the same page and also force knowledge transfer
3. Lets definitely be updating the user docs/dev docs
4. Once we have the d8 and kitchen sink example func tests lets also be adding tests on every commit
5. Lets wait on unit tests until things settle down a bit but a good rule of thumb is try to put things we would want to unit tests in `lib` somewhere.
