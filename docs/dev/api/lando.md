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

// Start an app
return lando.app.start(app);

// Check to see if a docker container is running
return lando.engine.isRunning({id: 'myapps_httpd_1'});

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

// Remove an app from the registry
return lando.registry.remove({app: name, dir: dir});

// Execute a command
return lando.shell.sh(['docker', 'info']);

// Add a new task to Lando
lando.tasks.add('fireeverything', task);
```

* [lando](#lando) : <code>object</code>
    * [.app](#lando.app)
    * [.bootstrap](#lando.bootstrap)
    * [.cli](#lando.cli) ⇒ <code>Array</code>
    * [.config](#lando.config) ⇒ <code>Array</code>
    * [.engine](#lando.engine) ⇒ <code>Array</code>
    * [.error](#lando.error) ⇒ <code>Array</code>
    * [.events](#lando.events) ⇒ <code>Array</code>
    * [.log](#lando.log) ⇒ <code>Array</code>
    * [.networks](#lando.networks) ⇒ <code>Array</code>
    * [.node](#lando.node) ⇒ <code>Array</code>
    * [.plugins](#lando.plugins) ⇒ <code>Array</code>
    * [.Promise](#lando.Promise) ⇒ <code>Array</code>
    * [.registry](#lando.registry) ⇒ <code>Array</code>
    * [.shell](#lando.shell) ⇒ <code>Array</code>
    * [.tasks](#lando.tasks) ⇒ <code>Array</code>
    * [.user](#lando.user) ⇒ <code>Array</code>
    * [.utils](#lando.utils) ⇒ <code>Array</code>

<a name="lando.app"></a>

### lando.app
The app module.

Contains helpful methods to manipulate Lando apps.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [app.md](app.md)  
**Since**: 3.0.0  
<a name="lando.bootstrap"></a>

### lando.bootstrap
The bootstrap module.

Contains helpful methods to bootstrap Lando.

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [bootstrap.md](bootstrap.md)  
**Since**: 3.0.0  
<a name="lando.cli"></a>

### lando.cli ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [cli.md](cli.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.config"></a>

### lando.config ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [config.md](config.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.engine"></a>

### lando.engine ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [engine.md](engine.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.error"></a>

### lando.error ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [error.md](error.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.events"></a>

### lando.events ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [events.md](events.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.log"></a>

### lando.log ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [logger.md](logger.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.networks"></a>

### lando.networks ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [networks.md](networks.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.node"></a>

### lando.node ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [node.md](node.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.plugins"></a>

### lando.plugins ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [plugins.md](plugins.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.Promise"></a>

### lando.Promise ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [promise.md](promise.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.registry"></a>

### lando.registry ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [registry.md](registry.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.shell"></a>

### lando.shell ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [shell.md](shell.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.tasks"></a>

### lando.tasks ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [tasks.md](tasks.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.user"></a>

### lando.user ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [user.md](user.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="lando.utils"></a>

### lando.utils ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [utils.md](utils.md)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Things |

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
