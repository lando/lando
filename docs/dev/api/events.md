<a name="AsyncEvents"></a>

## AsyncEvents ⇐ <code>events.EventEmitter</code>
**Kind**: global class  
**Extends**: <code>events.EventEmitter</code>  
**Classdec**: Extends the core node events.EventEmitter so that it is promisified, blocking and with event priorities.  

* [AsyncEvents](#AsyncEvents) ⇐ <code>events.EventEmitter</code>
    * [new AsyncEvents()](#new_AsyncEvents_new)
    * [.__on](#AsyncEvents+__on)
    * [.__emit](#AsyncEvents+__emit)
    * [.on(name, [priority], fn)](#AsyncEvents+on) ⇒ <code>Promise</code>
    * [.emit(name, [...args])](#AsyncEvents+emit) ⇒ <code>Promise</code>

<a name="new_AsyncEvents_new"></a>

### new AsyncEvents()
Creates a new AsyncEvents emitter.

<a name="AsyncEvents+__on"></a>

### asyncEvents.__on
Stores the old event on method.

**Kind**: instance property of [<code>AsyncEvents</code>](#AsyncEvents)  
**See**: https://nodejs.org/api/events.html#events_emitter_on_eventname_listener  
<a name="AsyncEvents+__emit"></a>

### asyncEvents.__emit
Stores the old event emit method.

**Kind**: instance property of [<code>AsyncEvents</code>](#AsyncEvents)  
**See**: https://nodejs.org/api/events.html#events_emitter_emit_eventname_args  
<a name="AsyncEvents+on"></a>

### asyncEvents.on(name, [priority], fn) ⇒ <code>Promise</code>
Reimplements event on method.

This optionally allows a priority to be specified. Lower priorities run first.

**Kind**: instance method of [<code>AsyncEvents</code>](#AsyncEvents)  
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
lando.events.on('post-instantiate-app', 1, function(app) {
  console.log(app);
});

// Log a helpful message after an app is started, don't worry about whether it runs before or
// after other `post-start` events
return app.events.on('post-start', function() {
  lando.log.info('App %s started', app.name);
});
```
<a name="AsyncEvents+emit"></a>

### asyncEvents.emit(name, [...args]) ⇒ <code>Promise</code>
Reimplements event emit method.

This makes events blocking and promisified.

**Kind**: instance method of [<code>AsyncEvents</code>](#AsyncEvents)  
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
