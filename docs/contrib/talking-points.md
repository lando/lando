---
description: Talking points for Lando
metaTitle: Talking Points | Lando
---

# Talking Points

Some talking points you can use in your presentations or next dinner date are shown below:

These are intended to try and convince a more-technical audience to adopt Lando. If you are interested in more business focused talking points, particularly if you are trying to convince an org to sponsor Lando, then check [these out](sponsor-upsell.md) instead.

## High Level

* The purpose of Lando is to liberate developers to focus on their most important work by providing a single, easy to use tool they can use on all their projects regardless of tech stack, operating system or hosting provider.
* The general idea behind Lando is to `git clone` a project, run `lando start` and get _everything_ you need to develop, test and deploy your project. This means not only the infrastructure to run your project but the tools to develop and test it as well.
* Lando is a development dependency management tool.

## Advantages

* **Speed and Scale** - Containers over VMs means each project can have its own dependencies and you can switch between them much much faster.
* **Standarization** - A single way for all your developers to interact with all your projects.
* **Parity** - Achieve parity with each project's hosting target.
* **Tooling** - Containerize tools along with services and lock down versions of things like `node` on a project to project basis. Say goodbye to things like `rvm` forever.
* **VCS** - Put your Landofile configuration in version control so it can be shared and tracked.
* **Integrations** - Integrate with hosting providers like [Pantheon](https://pantheon.io) or [Platform.sh](https://platform.sh).
* **Sane defaults** - Lando will give you recommended settings out of the box but it is hyper-configurable. You can have a two line or two hundred line Landofile.

## Key Differences

* Lando is designed to run _any_ project you have.
* Lando has built in build steps and event automation.
* Lando has never raised money, and won't, so you know it's grassroots shit.
* Lando is the engine that powers other popular tools like Acquia's Dev Studio or Pantheon's Localdev.
* Lando is the culmination of over 10 years of expertise in this space.

## Docker Compose

* Lando is built on top of Docker Compose and functions as a Docker Compose abstraction layer, superset and utility.
* As a Docker Compose utility, Lando handles some of the more tedious setup like networking, SSL, proxying, etc.
* As a super set, Lando provides ways for developers to run complex commands, build steps and automation on their services without the hassle of custom Dockerfiles or long "docker exec" commands.
* As an abstraction layer, Lando vastly reduces the complexity of spinning up containers by exposing only the most relevant config for a given "service" and setting "sane defaults".
* Lando can also be overridden down to the Docker level so all its power is still available when needed.

## Data

* Over 11,000 monthly users
* 80% of developers use a recipe
* Our most popular recipes are Drupal 8, WordPress and Pantheon
* Slack community of over 1,000 developers
* Over 100 open source contributors

_This data was last updated in early 2020._

## Misc

* Lando is officially version 3. This reflects its Kalabox heritage which had two major versions.
* Lando was supposed to only be the code name for this project but it got popular too fast and the name stuck.
* Lando is the only local development solution that has [a mascot](https://www.youtube.com/watch?v=dQw4w9WgXcQ).
