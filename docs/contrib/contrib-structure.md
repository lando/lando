---
description: Learn about Lando's project and directory structure.
---

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

Some notes about the structure are below:

* Code that is easily unit testable and does not require the `lando` object should live in `lib`.
* Code that requires the `lando` object should be expressed in `plugins`.
* Code that extends the core `lando` object will *almost always* be in `plugins` and not `lib`.
