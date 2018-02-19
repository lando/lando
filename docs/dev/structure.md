Project Structure
=================

Lando Core
----------

Here is a general breakdown of where things live inside the Lando repo.

```bash
./
|-- .github         Helpful GitHub templates
|-- .platform       Platform.sh config to run our docs site
|-- bin             CLI entrypoint script
|-- docs            Source markdown files for the documentation you are reading
|-- examples        Example Lando apps, used generally and in this documentation
|-- installer       Installer pkgs and helpers
|-- lib             Core libraries
|-- plugins         Core plugins
|-- scripts         Scripts to help with build, test and deploy automation
|-- test            Unit and functional tests
```

Some notes about the structure:

* Code that is easily unit testable and does not require the `lando` object should live in `lib`.
* Code that requires the `lando` object should be expressed in `plugins`.
* Code that extends the core `lando` object will *almost always* be in `plugins` and not `lib`.

Lando Plugins
-------------

Lando plugins have a similar structure. Here is an example plugin.

```bash
./
|-- lib             Unit testable libraries that do not require the `lando` object
|-- test            Unit and functional tests
|-- module.js       A module that requires the `lando` object and extends it
|-- index.js        Entrypoint script that usually subscribes to various `lando` events
```
