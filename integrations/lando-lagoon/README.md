# Lagoon Development Guide

This guide contains information to help onboard developers to work on the [Lagoon](https://lagoon.readthedocs.io/en/latest/) integration, hereafter referred to as "the plugin".

After reading through it the developer should understand:

* The high level goals of the integration
* The general features roadmap
* How the plugin is structured
* How additional services containers are added
* How additional tooling is added
* How the project is tested
* Where framework level overrides live
* Contributing code

It may also be valuable to review the [user documentation](https://docs.lando.dev/config/lagoon.html) for this integration as that provides a bit of a Specification as Documentation.

## Overview

The high level goals of the integration are straightforward:

### 1. Use Lagoon images

This allow users to run their Lagoon projects locally using the same images, build processes, configuration, etc as they do on Lagoon itself. This means that a Landofile using the `lagoon` recipe can be be something simple like this:

```yaml
name: lando-d8
recipe: lagoon
```

The implication here is that Lando will instead look and use the `lagoon` configuration files, including its `docker-compose` files instead of its own mechanisms. You can, however, still use the Landofile for additional power you may need exclusively in the local context.

### 2. Provide feature parity with the existing `pgymy` local dev tools

We are trying to reach feature parity with their [current tooling](https://lagoon.readthedocs.io/en/latest/using_lagoon/local_development_environments/) which while functional is not as easy to setup and get running as Lando.

Specifically this means the Lando integration needs to:

* Have a reverse proxy for nice URL
* Handle user's SSH keys
* Provide `mailhog` for email capture

As you have probably noted, Lando does the above OOTB so this should not be a huge challenge. The value add that Lando provides here is basically simplying the onboarding and spinup process and standardizing that flow across os, projects, etc.

### 3. Provide other "flavors" and a broader base of "services"

There are many larger Lagoon clients like GovCMS who have extended the default Lagoon local dev tooling to handle their particular use case. Lando should also surface or recreate that tooling if the user chooses that "flavor" of Lagoon.

Lando should also support most/all of the [Lagoon images](https://lagoon.readthedocs.io/en/latest/using_lagoon/docker_images/elasticsearch/) OOTB and any other generic flavors deemed critical eg "wordpress".

### 4. Interact with the remote Lagoon environment

TBD on how we want to do this.

### 5. Get all the other built-in benefits of Lando

RTFM if you need more info on dat.

## Roadmap

We have currently secured funding for the first phase of the roadmap but we still need to fund phases two and three.

The tentative roadmap for acheiving the above is

### 1. Alpha Release (Fall 2020)

* An alpha quality release that covers sections 1. and 2. in the overview.
* This release is scheduled to be an "internal alpha" but it may be ok to cast a wider net as long as the alpha part is understood.
* A user should be able to `lando init` a cloned down `lagoon` Drupal 8/9 git repo that is properly configured for use with Lando and get it running
* Popular Drupal services like `mariadb`, `mysql`, `memcached`, `redis`, `solr`, `postgresql` and `varnish` are expected to work

These are all expected to be delivered at `alpha` level quality eg the 80/20 rule for use case coverage is probably a good quality threshold.

### 2. Public Beta Release (TBD)

* TBD

### 3. Public RC Release (TBD)

* TBD

### 4. Long Term Support (TBD)

* TBD

## Project Structure

This plugin follows the same structure as any [Lando plugin](https://docs.lando.dev/contrib/contrib-plugins.html#plugins) but here is an explicit breakdown:

```bash
./
|-- lib             Utilities and helpers, things that can easily be unit tested
|-- recipes
    |-- lagoon      The files to define the `lagoon` recipe and its `init` command
|-- services        Defines each Lagoon service eg `solr` or `php`
|-- test            Unit tests
|-- types           Defines the type/parent each above service can be
|-- app.js          Modifications to the app runtime
|-- index.js        Modifications to the Lando runtime
```

## Services and Types

Inside of the `services` folder you will see where we define the Lando services that roughly correspond to each Lagoon Docker image. Lando determines which lando service to use based on the `lando.type` Docker label. You can see that in action [here](https://github.com/amazeeio/drupal-example-simple/blob/9.x/docker-compose.yml#L45).

All services are also passed through the `_lagoon` type builder found in `types/lagoon`. This just provides handling that all lagoon images use.

Generally, the lando Lagoon services are directly configured from the corresponding service in Lagoon's `docker-compose` file. Some things are omitted or slightly modified to match up with what Lando expects. For example Lando ignores Lagoon's `volumes`, `volumes_from`, `networks` and `user` config in favor of its own. Lando will also modify the container `command` so that it runs through the `lando-entrypoint.sh`.

## Getting started

It's easiest to develop by spinnning up the Lagoon D9 example directly in the Lando codebase

* [Drupal 9](https://github.com/lando/lando/tree/master/examples/lagoon-drupal9)

```bash
# This assumes you have already installed lando from source and are in its root directory
cd examples/lagoon-drupal9

# Spin up the example
rm -rf drupal && mkdir -p drupal && cd drupal
lando init --source remote --remote-url git://github.com/amazeeio/drupal-example-simple.git --remote-options="--branch 9.x" --recipe lagoon
lando start

# Optionally install drupal
lando drush si -y
```

## Other considerations

### Limited support

Currently, it is expected that Lando only works with [this example](https://github.com/amazeeio/drupal-example-simple/). We will be developing our feature set in tandem with Amazee as they expand that example or add support to other examples.

### Development

This is going to be a lean and agile project where user feedback drives development. For example a user is going to try it out and say "cool, but what about solr", Amazee will add support for Solr to the relevant example repos, let us know, and then we will add support/tests for solr in Lando.

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

Func tests are made by just adding more entries to each examples README. This uses our made-just-for-Lando testing framework [Leia](https://github.com/lando/leia). See below for our current lagoon tests:

* [Drupal 9](https://github.com/lando/lando/tree/master/examples/lagoon-drupal9)

These are then run by CircleCI. While you _can_ run all the func test locally this can take a LONG time. If you decide you want to do that we recommend you generate the test files and then invoke the tests for just one example.

```bash
# Generate tests
yarn generate-tests

# Run a single examples tests
yarn mocha --timeout 900000 test/lagoon-drupal-9-example.func.js
```

## Contribution

WIP but outline is

1. GitHub flow as normal eg branch for an issue -> PR -> merge
2. Lets review all Lagoon PRs together for awhile: this should keep us on the same page and also force knowledge transfer
3. Lets definitely be updating the user docs/dev docs
4. Once we have the d8 and kitchen sink example func tests lets also be adding tests on every commit
5. Lets wait on unit tests until things settle down a bit but a good rule of thumb is try to put things we would want to unit tests in `lib` somewhere.
