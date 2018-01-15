Some Refactor Notes
===================

1. Determining "Core" modules
-----------------------------

```
|- lib/bootstrap.js
|- lib/cache.js
|- lib/cli.js
|- lib/config.js
|- lib/env.js
|- lib/error.js
|- lib/events.js
|- lib/lando.js
|- lib/logger.js
|- lib/metrics.js
|- lib/node.js
|- lib/plugins.js
|- lib/promise.js
|- lib/serializer.js
|- lib/shell.js
|- lib/tasks.js
|- lib/update.js
|- lib/user.js
|- lib/utils.js
|- lib/yaml.js
```

2. Core Decoupling and Deconstruction Considerations
----------------------------------------------------

First pass on proposed changes!

### Generic Considerations

* We definitely need to improve (mostly Classify) many modules so their deps can be constructed or injected. Primarily for the `logger` and `config`.

### Specific Considerations

#### bootstrap.js

* Move config summoning into the main function export

#### cache.js

* Make this into a Class that takes construction options so we aren't coupled to `config.js`

#### cli.js

* `init` probably should be invoked directly in `bin/lando.js`

#### config.js

* This might be OKish but i think we won't know till we start decoupling other things from it

#### env.js

* Maybe this should just be part of `config.js`?

### lando.js

* Remove non-core stuff

### logger.js

* Remove coupling to `config.js`, make into some sort of classy thing

### plugins.js

* Remove almost inexplicable coupling to `lando.js`, have `load` take an `injectTHIS` arg (which would be lando)

#### update.js

* Guesing we want to split this up into a core function that determines and caches the update status and then the actual display logic

#### utils.js

* We probably just want to break this up and put its pieces elsewhere

3. Pluginification
------------------

A bunch of stuff currently in `lib` is probably better placed as plugins. This would

* Provide us a more decoupled situation because plugins get a fully instantiated `lando` object
* Make the core of lando not geared towards any functional purpose (eg make it a general framework for building things)
* Provide a clearer line between what should be core and what should be plugin

Presumably we would want to augment the `lando-core` plugin to include the following files. Eventually these will all be refactored as part of 4 below

```
lib/app.js
lib/compose.js
lib/container.js
lib/daemon.js
lib/docker.js
lib/engine.js
lib/networks.js
lib/registry.js
```

### TODOS

* Figure out **exactly** how we want to move the above into `lando-core` with an eye to 4.

4. Plugin Standarization
------------------------

We want to make provide a conventional plugin structure standard to maximize testability and minimize WTFIT.

```
|- lib/
|- tests/
|- index.js
```

### lib

Should contain unit-testable things that are not tied to `lando` object things (with the exception of maybe the logger?)

### test

Should contain the mocha testzzzz

### index.js

This is the module that gets injected with `lando` and **ideally** should contain almost exclusively `lando` events that pull in stuff from `lib`.
