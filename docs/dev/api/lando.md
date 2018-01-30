<a name="lando"></a>

## lando : <code>object</code>
This is the high level object that contains the Lando libraries.

**Kind**: global namespace  
**Since**: 3.0.0  
**Example**  
```js
// Get lando
var lando = require('./lando')(globalConfig);

// Add an item to the cache
lando.cache.set('mykey', data);

// Log an error
lando.log.error('Ive got a baaaad feeling about this');

// Access a global config property
var plugins = lando.config.plugins;

// Emit an event
return lando.events.emit('battle-of-yavin', fleetOpts);

// Run a function when an event is triggered
return lando.events.on('battle-of-yavin', stayOnTarget);

// Get the lodash module for our plugin
var _ = lando.node._;

// Retry a function with a Promise.
return lando.Promise.retry(lando.engine.start(container)));

// Load a plugin
return lando.plugins.load('hyperdrive');

// Execute a command
return lando.shell.sh(['docker', 'info']);

// Add a new task to Lando
lando.tasks.add('fireeverything', task);
```

* [lando](#lando) : <code>object</code>
    * [.cache](#lando.cache)
    * [.cli](#lando.cli)
    * [.config](#lando.config)
    * [.events](#lando.events)
    * [.log](#lando.log)
    * [.node](#lando.node)
    * [.plugins](#lando.plugins)
    * [.Promise](#lando.Promise)
    * [.scanUrls](#lando.scanUrls)
    * [.shell](#lando.shell)
    * [.tasks](#lando.tasks)
    * [.updates](#lando.updates)
    * [.user](#lando.user)
    * [.utils](#lando.utils)
    * [.yaml](#lando.yaml)

<a name="lando.cache"></a>

### lando.cache
The cache module.

Contains helpful methods to cache data.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [cache.md](cache.md)  
**Since**: 3.0.0  
<a name="lando.cli"></a>

### lando.cli
The cli module.

Contains helpful methods to init a CLI, inject commands and display CLI data.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [cli.md](cli.md)  
**Since**: 3.0.0  
<a name="lando.config"></a>

### lando.config
The global config object

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [config.md](config.md)  
**Since**: 3.0.0  
<a name="lando.events"></a>

### lando.events
The events module.

An instance of AsyncEvents.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [events.md](events.md)  
**Since**: 3.0.0  
<a name="lando.log"></a>

### lando.log
The logging module.

Contains logging methods.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [log.md](log.md)  
**Since**: 3.0.0  
<a name="lando.node"></a>

### lando.node
The node module.

Contains helpful node modules like `lodash` and `restler` that can be
used in plugins.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [node.md](node.md)  
**Since**: 3.0.0  
<a name="lando.plugins"></a>

### lando.plugins
The plugins module.

Contains helpful methods to load Lando plugins.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [plugins.md](plugins.md)  
**Since**: 3.0.0  
<a name="lando.Promise"></a>

### lando.Promise
The Promise module.

An extended `bluebird` Promise object.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [promise.md](promise.md)  
**Since**: 3.0.0  
<a name="lando.scanUrls"></a>

### lando.scanUrls
The scan module.

Contains a URL scanner

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [shell.md](shell.md)  
**Since**: 3.0.0  
<a name="lando.shell"></a>

### lando.shell
The shell module.

Contains helpful methods to parse and execute commands.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [shell.md](shell.md)  
**Since**: 3.0.0  
<a name="lando.tasks"></a>

### lando.tasks
The tasks module.

Contains helpful methods to define and parse Lando tasks.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [tasks.md](tasks.md)  
**Since**: 3.0.0  
<a name="lando.updates"></a>

### lando.updates
The update module.

Contains warnings and help if update is needed

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [update.md](update.md)  
**Since**: 3.0.0  
<a name="lando.user"></a>

### lando.user
The user module.

Contains helpful methods to get information about user running Lando.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [user.md](user.md)  
**Since**: 3.0.0  
<a name="lando.utils"></a>

### lando.utils
The utils module.

Contains helpful utility methods.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [utils.md](utils.md)  
**Since**: 3.0.0  
<a name="lando.yaml"></a>

### lando.yaml
The yaml module.

Contains helpful yaml methods.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [yaml.md](yaml.md)  
**Since**: 3.0.0  
