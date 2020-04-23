<a name="lando.events.on"></a>

## lando.events.on(name, [priority], fn) ⇒ <code>Promise</code>
Our overridden event on method.

This optionally allows a priority to be specified. Lower priorities run first.

**Kind**: global function
**Returns**: <code>Promise</code> - A Promise
**Since**: 3.0.0

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | The name of the event |
| [priority] | <code>Integer</code> | <code>5</code> | The priority the event should run in. |
| fn | <code>function</code> |  | The function to call. Should get the args specified in the corresponding `emit` declaration. |

**Example**
```js
// Print out all our apps as they get instantiated and do it before other `post-instantiate-app` events
lando.events.on('post-instantiate-app', 1, app => {
  console.log(app);
});

// Log a helpful message after an app is started, don't worry about whether it runs before or
// after other `post-start` events
return app.events.on('post-start', () => {
  lando.log.info('App %s started', app.name);
});
```
<a name="lando.events.emit"></a>

## lando.events.emit(name, [...args]) ⇒ <code>Promise</code>
Reimplements event emit method.

This makes events blocking and promisified.

**Kind**: global function
**Returns**: <code>Promise</code> - A Promise
**Since**: 3.0.0

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the event |
| [...args] | <code>Any</code> | Options args to pass. |

**Example**
```js
// Emits a global event with a config arg
return lando.events.emit('wolf359', config);

// Emits an app event with a config arg
return app.events.emit('sector001', config);
```
