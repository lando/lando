Config System
=============

The Kalabox config system is highly flexible and allows you to configure a few things, such as...

  * The default domain suffix.
  * The plugins it should load.
  * The plugin that contains the engine implementation.

kalabox.yaml
-------------

This file specifies the core configuration options for Kalabox. If you wanted to fork Kalabox and use your own config or plugins this is the file you would want to change. Kalabox will scan a few different directories for the presence of a `kalabox.yml` file. If it finds one it will override the default config. Here is the order the overrides take place.

  1. The default `kalabox.yml`. If you've installed Kalabox from source this will be in the source root.
  2. The `kalabox.yml` inside of the `sysConfRoot`. For example `/usr/share/kalabox` on Linux.
  3. The `kalabox.yml` inside of the `userConfRoot`. For examples `~/.kalabox/` on macOS.

!!! attention "Where are `sysConfRoot` and `userConfRoot`?"
    Run `kbox config` to find the location of these directories as they can be different.

Here is the default `kalabox.yml` file as of `v0.13.x`.

```yaml
#
# Domain
#
# You can change the domain suffix used by default. The support level of
# this setting is currently unknown.
#
domain: kbox.site

#
# Global plugins
#
# These are plugins that Kalabox should load by default.
#   Inside of Kalabox source/binary
#
globalPlugins:
  - kalabox-core
  - kalabox-cmd
  - kalabox-services-kalabox
  - kalabox-sharing
  - kalabox-ui

#
# Console log level
#
# Determines the verbosity with which messages are printed to the screen
#
#   Options: [debug|info|none]
#
logLevelConsole: none

#
# Log level
#
# Determines the verbosity with which messages are added to the log
#
#   Options: [debug|info|none]
#
# logLevel: debug

#
# Engine
#
# The engine is a special kind of plugin that implements the Kalabox container
# interface.
#
#   Options: [plugin-name]
#
# You generally are not going to want to change this unless you've got a
# good replacement
#
engine: kalabox-engine-docker

```

!!! tip "What things can I override?"
    Anything that shows up in `kbox config` is overrideable. That said, take caution, as some settings should not be altered.

Getting Started
===============

!!! warning "For Developers Working on Kalabox Only"
    If you're looking for documentation on how to use Kalabox, see the [Getting Started](./../users/started) guide in the "For Users" section.

You should be able to use this guide to...

1. Install Kalabox from source
2. Learn where all the things are
3. Run the CLI and GUI from source

Installation
------------

For installation you will want both the latest Kalabox development release (to get the latest Kalabox engine running) and the Kalabox source code.

### 1. Install the latest development release

Get the latest Kalabox engine up and running up by installing the latest development release. It's best to just...

1. Grab the [latest development release](./../#development-releases)
2. Follow the normal [installation guide](./../users/install)

### 2. Install the Kalabox source

!!! danger "Requires nodejs 4.2+ and grunt-cli"
    Make sure you [install node](http://nodejs.org) and `npm install -g grunt-cli` before you begin.

We have the latest Kalabox engine but we want to run the CLI and GUI from source
so we can hack on them. Let's grab and install the source.

```bash
git clone https://github.com/kalabox/kalabox.git && cd kalabox
npm install
```

### 3. Set up a symlink to run the dev version of the Kalabox CLI

This is optional, but makes things a lot easier.

```bash
# Set up a symlink so you can use `kbox.dev` to run the CLI from source
sudo ln -s /path/to/repo/bin/kbox.js /usr/local/bin/kbox.dev
which kbox.dev
kbox.dev
```

With the symlink, you can still run your production CLI `kbox` normally while relying on `kbox.dev` for development.

Code locations
--------------

Here is a general breakdown of where things live inside the Kalabox repo.

```bash
./
|-- bin             CLI entrypoints js scripts
|-- docs            Source markdown files for the documentation you are reading
|-- installer       Installer pkgs and scripts
|-- lib             Core Kalabox libraries (used in both CLI and GUI)
|-- modules         Custom and local node modules
|-- plugins         Core Kalabox plugins
|-- scripts         Scripts to help with CI and building the installers
|-- src             Angular code for the NWJS GUI
|-- tasks           Modularized Grunt tasks
|-- test            CLI, GUI and installer tests
```

Run the CLI and GUI from source
-------------------------------

### CLI

```bash
# If you followed #3 above
kbox.dev

# Or just run the CLI directly with node
node /path/to/repo/bin/kbox.js
```

### GUI

!!! danger "Requires sass be installed"
    Make sure you install sass with `gem install sass` before you begin.

```bash
# Run the GUI from source
grunt gui
```

Plugins
=======

Kalabox has an advanced plugin system that allows developers to add and extend Kalabox's core functionality. Here are a few examples of things you can do with plugins:

  1. Implement `kbox create` to provide an easy way for users to generate apps.
  2. Add additional commands to be used with the Kalabox CLI.
  3. Hook into various Kalabox runtime events to provide additional functionality.
  4. Print "A British tar is a soaring soul!" after every app is started.

!!! caution "Can I use plugins to extend the GUI?"
    Not yet. :( Right now there is no distinction between core GUI features, features dedicated to the Pantheon plugin, and features dedicated to the PHP plugin. In the future we hope to de-couple these pieces of functionality to reflect the structure that the Kalabox CLI functionality has obtained.

    See [Remove app specific functionality from GUI and move into app projects](https://github.com/kalabox/kalabox/issues/1393) for updates on progress.

Installation
------------

To get the plugin working with Kalabox do two things:

  1. [Override config](./config) to include your plugin's name.
  2. Place your plugin into the correct location. (see below)

Kalabox looks for plugins in either the `node_modules` or `plugins` folder in three separate locations. If there are multiple instances of the same plugin, Kalabox will load the one found furthest down this list:

  1. The source directory.
  2. Inside of the `sysConfRoot`. For example `/usr/share/kalabox` on Linux.
  3. Inside of the `userConfRoot`. For example `~/.kalabox/` on macOS.

!!! attention "Where are `sysConfRoot` and `userConfRoot`?"
    Run `kbox config` to find the location of these directories as they can be different.

### Example 1: Use the latest version of the "Pantheon on Kalabox" plugin.

Kalabox ships with two external plugins by default: ["Pantheon on Kalabox"](http://github.com/kalabox/kalabox-app-pantheon) and ["PHP on Kalabox"](http://github.com/kalabox/kalabox-app-php). These are installed into your `sysConfRoot` by the Kalabox installer along with a `kalabox.yml` override file. Let's say we want to do development on the "Pantheon on Kalabox" plugin.

```bash
# Go into the `usrConfRoot`; assuming macOS and `~/.kalabox` for this example
cd ~/.kalabox

# Create a plugins folder
mkdir -p plugins
cd plugins

# Get the plugin
git clone https://github.com/kalabox/kalabox-app-pantheon.git
cd kalabox-app-pantheon

# Install its dependencies
npm install
cd app
npm install
```

Now your Kalabox should use the "Pantheon on Kalabox" plugin that is in your `usrConfDir` instead of your `sysConfRoot`.

!!! note "Why don't we need to add our plugins to a `kalabox.yml` file?"
    Since "Pantheon on Kalabox" ships with Kalabox we've already provided an override `kalabox.yml` file that looks for our plugin. Go into your `sysConfRoot` to find it.

Shipping
========

We have `grunt` commands to easily package and ship Kalabox for release.

Building
--------

!!! note "Cross compiling is not currently supported"
    Due to an upstream restriction imposed on us by `jxcore` we cannot cross compile.

```bash
# Package the Kalabox CLI into a binary
grunt pkg:cli
cd dist/cli

# Package the Kalabox GUI
grunt pkg:gui
cd dist/gui

# Package both the CLI and GUI into an installer
grunt pkg
cd dist
```

Rolling a release
-----------------

!!! attention "Test installers first"
    Until our CI can run cross platform installer tests, it's recommended to [run these tests manually](./testing/#installer-tests) before rolling a new release.

If you are an administrator of the Kalabox repo you can push various releases using the following...

```bash
# Do a minor ie 0.x.0 bump and push a release
grunt release --dry-run
grunt release

# Do a patch ie 0.0.x bump and push a release
grunt patch --dry-run
grunt patch

# Do a prerelease ie 0.0.0-alpha.x bump and push a release
grunt prerelease --dry-run
grunt prerelease
```
Testing
=======

You should be able to use this guide to...

1. Check code styling and linting
2. Run CLI, GUI and Installer tests
3. Learn how to write tests

Running Tests
-------------

### Code linting and standards

Kalabox implements some basic linting and code standards to make sure things remain consistent between developers and to prevent syntax errors. You can easily check whether your code matches these standards using grunt.

```bash
grunt test:code
```

### Unit tests

The unit tests use [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/). They primarily test the CLI.

```bash
grunt test:unit
```

### Installer tests

!!! danger "USE EXTREME CAUTION"
    If you run these tests on a machine that already has Kalabox installed it is most likely going to wipe away your currently installed version of Kalabox. For that reason please **BE CAREFUL USING THIS!!!**

The installer tests use the [BATS framework](https://github.com/sstephenson/bats).

```bash
grunt func
```

Writing Tests
-------------

Tests reside in the "test" folder. For examples of unit tests look for ".spec.js" files in the "test" folder. For examples of functional tests look for ".bats" files in the "test" folder.

Looking at existing tests will give you a good idea of how to write your own, but if you're looking for more tips, we recommend:

* [Mocha documentation](http://mochajs.org/)
* [Chai documentation](http://chaijs.com/)
* [Chai-As-Promised documentation](http://chaijs.com/plugins/chai-as-promised/)
* [BATS wiki](https://github.com/sstephenson/bats)
* [BATS tutorial](https://blog.engineyard.com/2014/bats-test-command-line-tools)
