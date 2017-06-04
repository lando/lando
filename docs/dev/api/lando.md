<a name="lando"></a>

## lando : <code>object</code>
This is the high level object wrapper that contains the Lando libraries.
Using this you can:

 * Perform actions on Lando apps
 * Bootstrap Lando
 * Access caching utilities
 *

**Kind**: global namespace  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | [description] |

**Example**  
```js
// Instantiate the Lando object
var lando = require('./lando')(config);

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```

* [lando](#lando) : <code>object</code>
    * [.app](#lando.app)
    * [.bootstrap](#lando.bootstrap) ⇒ <code>Array</code>
    * [.cache](#lando.cache) ⇒ <code>Array</code>
    * [.cli](#lando.cli) ⇒ <code>Array</code>
    * [.config](#lando.config) ⇒ <code>Array</code>
    * [.engine](#lando.engine) ⇒ <code>Array</code>
    * [.error](#lando.error) ⇒ <code>Array</code>
    * [.events](#lando.events) ⇒ <code>Array</code>
    * [.log](#lando.log) ⇒ <code>Array</code>
    * [.metrics](#lando.metrics) ⇒ <code>Array</code>
    * [.networks](#lando.networks) ⇒ <code>Array</code>
    * [.node](#lando.node) ⇒ <code>Array</code>
    * [.plugins](#lando.plugins) ⇒ <code>Array</code>
    * [.Promise](#lando.Promise) ⇒ <code>Array</code>
    * [.shell](#lando.shell) ⇒ <code>Array</code>
    * [.tasks](#lando.tasks) ⇒ <code>Array</code>
    * [.user](#lando.user) ⇒ <code>Array</code>
    * [.utils](#lando.utils) ⇒ <code>Array</code>

<a name="lando.app"></a>

### lando.app
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**See**: [app.md](app.md)  
**Since**: 3.0.0  
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
<a name="lando.bootstrap"></a>

### lando.bootstrap ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [bootstrap.md](bootstrap.md)  
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
<a name="lando.cache"></a>

### lando.cache ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [cache.md](cache.md)  
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
<a name="lando.metrics"></a>

### lando.metrics ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static property of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [metrics.md](metrics.md)  
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
