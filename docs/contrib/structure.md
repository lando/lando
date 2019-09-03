# Project Structure

Here is a general breakdown of where things live inside the Lando repo.

```bash
./
|-- .circleci       CircleCi config to run our generated functional tests
|-- .github         Helpful GitHub templates
|-- .platform       Platform.sh config to run our docs site
|-- bin             CLI entrypoint script
|-- docs            Source markdown files for the documentation you are reading
|-- examples        Examples user in this documentation and to generate func tests
|-- installer       Installer pkgs and helpers
|-- lib             Core libraries
|-- plugins         Core plugins
|-- scripts         Scripts to help with build, test and deploy automation
|-- test            Unit and functional tests
|-- .travis.yml     Travis CI config for POSIX unit tests, build and deploy
|-- appveyor.yml    Appveyor config for Windows unit tests, build and deploy
|-- book.json       GitBook configuration
|-- config.yml      Default Lando global config
|-- package.json    Lando node dependencies
```

Some notes about the structure:

* Code that is easily unit testable and does not require the `lando` object should live in `lib`.
* Code that requires the `lando` object should be expressed in `plugins`.
* Code that extends the core `lando` object will *almost always* be in `plugins` and not `lib`.
