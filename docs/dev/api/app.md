<a name="module_app"></a>

## app
Contains methods and events related to app actions.

**Since**: 3.0.0  
**Example**  
```js
// Get the lando object
var lando = require('lando')(config);

// Start an app
return lando.app.start(app)

// and then print a success message
.then(function() {
  console.log('App started!');
 });
```

* [app](#module_app)
    * _static_
        * [.list([opts])](#module_app.list) ⇒ <code>Array</code>
        * [.get()](#module_app.get) ⇒ <code>number</code>
        * [.isRunning()](#module_app.isRunning) ⇒ <code>number</code>
        * [.exists()](#module_app.exists) ⇒ <code>number</code>
        * [.info()](#module_app.info) ⇒ <code>number</code>
        * [.uninstall()](#module_app.uninstall) ⇒ <code>number</code>
        * [.cleanup()](#module_app.cleanup) ⇒ <code>number</code>
        * [.start()](#module_app.start) ⇒ <code>number</code>
        * [.stop()](#module_app.stop) ⇒ <code>number</code>
        * [.restart()](#module_app.restart) ⇒ <code>number</code>
        * [.destroy()](#module_app.destroy) ⇒ <code>number</code>
        * [.rebuild()](#module_app.rebuild) ⇒ <code>number</code>
        * ["event:pre-app-instantiate"](#module_app.event_pre-app-instantiate)
    * _inner_
        * [~instantiate()](#module_app..instantiate)
        * ["post-instantiate-app"](#event_post-instantiate-app)
        * ["app-ready"](#event_app-ready)
        * ["pre-info"](#event_pre-info)
        * ["post-info"](#event_post-info)
        * ["pre-uninstall"](#event_pre-uninstall)
        * ["post-uninstall"](#event_post-uninstall)
        * ["pre-start"](#event_pre-start)
        * ["post-start"](#event_post-start)
        * ["pre-stop"](#event_pre-stop)
        * ["post-start"](#event_post-start)
        * ["pre-destroy"](#event_pre-destroy)
        * ["post-destroy"](#event_post-destroy)
        * ["pre-rebuild"](#event_pre-rebuild)
        * ["post-rebuild"](#event_post-rebuild)

<a name="module_app.list"></a>

### app.list([opts]) ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>Array</code> - Returns the total.  
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
<a name="module_app.get"></a>

### app.get() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.isRunning"></a>

### app.isRunning() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.exists"></a>

### app.exists() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.info"></a>

### app.info() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Emits**: [<code>pre-info</code>](#event_pre-info), [<code>post-info</code>](#event_post-info)  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.uninstall"></a>

### app.uninstall() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.cleanup"></a>

### app.cleanup() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.start"></a>

### app.start() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.stop"></a>

### app.stop() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.restart"></a>

### app.restart() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.destroy"></a>

### app.destroy() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.rebuild"></a>

### app.rebuild() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#module_app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="module_app.event_pre-app-instantiate"></a>

### "event:pre-app-instantiate"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="module_app..instantiate"></a>

### app~instantiate()
Instantiate

**Kind**: inner method of [<code>app</code>](#module_app)  
**Emits**: <code>event:pre-app-instantiate</code>, [<code>post-instantiate-app</code>](#event_post-instantiate-app), [<code>app-ready</code>](#event_app-ready)  
<a name="event_post-instantiate-app"></a>

### "post-instantiate-app"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_app-ready"></a>

### "app-ready"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_pre-info"></a>

### "pre-info"
Snowball event.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isPacked | <code>boolean</code> | Indicates whether the snowball is tightly packed. |

<a name="event_post-info"></a>

### "post-info"
Snowball event.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isPacked | <code>boolean</code> | Indicates whether the snowball is tightly packed. |

<a name="event_pre-uninstall"></a>

### "pre-uninstall"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_post-uninstall"></a>

### "post-uninstall"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_pre-start"></a>

### "pre-start"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_post-start"></a>

### "post-start"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_pre-stop"></a>

### "pre-stop"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_post-start"></a>

### "post-start"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_pre-destroy"></a>

### "pre-destroy"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_post-destroy"></a>

### "post-destroy"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_pre-rebuild"></a>

### "pre-rebuild"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="event_post-rebuild"></a>

### "post-rebuild"
stuff guys

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
