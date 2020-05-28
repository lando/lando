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

# Project Structure

This plugin follows the same structure as any [Lando plugin](https://docs.lando.dev/contrib/contrib-plugins.html#plugins) but here is an explicity breakdown:

```bash
./
|-- lib             Utilities and helpers, things that can easily be unit tested
|-- recipes
    |-- platformsh  The files to define the `platformsh` recipe and its `init` command
|-- scripts         Helpers scripts that end up /helpers/ inside each container
|-- services        Defines each platform.sh service eg `redis` or `php`
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

## BUILD

The platform.sh BUILD step uses an internal Lando `build` step behind the scenes. This means it:

1. Only runs on the initial `lando start` and subsequent `lando rebuilds`
2. Runs _before_ the container STARTS and before any user-defined build steps

The BUILD step will use `scripts/psh-build.sh`. This has a few differences from Platform

1. BUILD will set `$HOME` to `/var/www` instead of `/app` so build artifacts/caches dont potentially in your git repo
2. BUILD will install the platform CLI first if it needs to
3. BUILD will use `platform local:build` (for now) instead of the underlying `/etc/platform/build`

## START

Start has a similar lifecycle to `BOOT` except that it ends by running `/etc/platform/start` instead of `/etc/platform/boot`.

Once `/etc/platform/start` finishes the main process/command is run. This is `exec init` for all containers. At this point each container should have a main process running and that process shuold be controlling a bunch of other processes eg `php-fpm` and `nginx` in the case of a `php` container.

However, these containers are all "living in the dark" and need to be OPENed so they can both talk to one another and handle requests.

## OPEN

OPEN is the step that most diverges from what Lando expects in that it requires Lando do additional things AFTER an app has started. Usually once an app has started Lando expects its ready to go. This is not the case for platform. Generally the flow that needs to happen here is:

1. Lando needs to OPEN each platform service eg non-application containers
2. Lando needs to collect the output from all these commands together
3. Lando needs to merge in additional data its previously collected such as the IP addresses of services
4. Lando then needs to inject this payload when it OPENs the application containers

Once this has completed each application container will be "open for business" and ready to handle requests. This is also required to set `PLATFORM_RELATIONSHIPS` which is very important so applications can easily connect to services.

Behind the scenes we use the helper script `scripts/psh-open.sh`.

## Services and Types

Inside of the `services` folder you will see where we define the Lando service that corresponds to each platform application container and service. Each service can either be a `platform-appserver` or a `plaform-service` and each of these are defined in the `types` folder.

A `platform-appserver` means it is an applicaton container eg a supported platform "langauge" eg a `type` you can define in a `.platform.app.yaml` file.

A `platform-service` means it something that goes in the `services.yaml`

If you want to add support for a new platform service or application container simply add a new one into the `services` folder and make sure you set the `parent` to either `_platformsh_service` or `_platformsh_appserver` as appropriate.

Also note that you will likely need to add it to `getLandoServiceType` which maps a `platform` `type `to a `lando` `type`.
https://github.com/lando/lando/blob/abf0648701b960e49f09bf9e569c83aca727666a/experimental/plugins/lando-platformsh/lib/services.js#L8


## Other considerations

1. HOME and psh-exec
2. lando logs

## Contribution

PR per issue
update docs
etc



## Testing

TBD but outline is

1. Currently no unit tests but they can live in `test` and should test the stuff in `lib`
2. Uses `leia` for functional tests and these live in `examples`
  * Should be a `platform-drupal` example
  * Should eventually be a `platform-kitchensink` example that
    * Serves to validate platform.sh's won docs
    * Uses a multiapp setup with each application type
    * Has each service type using some more complex configuration for each
    * Each application should run a trivial example that exists to test connecting to each service and veryfying their config eg the code examples in the platform.sh docs themselves https://docs.platform.sh/languages/php.html#accessing-services

## Adding Services

## Adding

## Contributing code

