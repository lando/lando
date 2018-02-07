<a name="Promise"></a>

## Promise ⇐ [<code>Promise</code>](#Promise)
**Kind**: global class  
**Extends**: [<code>Promise</code>](#Promise)  
**Classdec**: Extends [bluebird](http://bluebirdjs.com/docs/api-reference.html) so that our promises have some retry functionality.  
**See**: [bluebird documentation](http://bluebirdjs.com/docs/api-reference.html)  

* [Promise](#Promise) ⇐ [<code>Promise</code>](#Promise)
    * [new Promise()](#new_Promise_new)
    * _instance_
        * [.retry(fn, [opts])](#Promise+retry) ⇒ [<code>Promise</code>](#Promise)
    * _static_
        * [.retry(fn, [opts])](#Promise.retry) ⇒ [<code>Promise</code>](#Promise)

<a name="new_Promise_new"></a>

### new Promise()
Creates a new Promise.

<a name="Promise+retry"></a>

### promise.retry(fn, [opts]) ⇒ [<code>Promise</code>](#Promise)
Adds a retry method to all Promise instances.

**Kind**: instance method of [<code>Promise</code>](#Promise)  
**Overrides**: [<code>retry</code>](#Promise+retry)  
**Returns**: [<code>Promise</code>](#Promise) - A Promise  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | The function to retry. |
| [opts] | <code>Opts</code> |  | Options to specify how retry works. |
| [opts.max] | <code>Integer</code> | <code>5</code> | The amount of times to retry. |
| [opts.backoff] | <code>Integer</code> | <code>500</code> | The amount to wait between retries. In miliseconds and cumulative. |

**Example**  
```js
// Start the deamon
return serviceCmd(['start'], opts)

// And then retry 25 times until we've connected, increase delay between retries by 1 second
.retry(function() {
  log.verbose('Trying to connect to daemon.');
  return shell.sh([DOCKER_EXECUTABLE, 'info'], {mode: 'collect'});
}, {max: 25, backoff: 1000});
```
<a name="Promise.retry"></a>

### Promise.retry(fn, [opts]) ⇒ [<code>Promise</code>](#Promise)
Adds a retry method to the bluebird Promise module.

**Kind**: static method of [<code>Promise</code>](#Promise)  
**Returns**: [<code>Promise</code>](#Promise) - A Promise  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | The function to retry. |
| [opts] | <code>Opts</code> |  | Options to specify how retry works. |
| [opts.max] | <code>Integer</code> | <code>5</code> | The amount of times to retry. |
| [opts.backoff] | <code>Integer</code> | <code>500</code> | The amount to wait between retries. In miliseconds and cumulative. |

**Example**  
```js
// Tries to get the container list with the default options
return Promise.retry(function() {
  return container.list(appName);
});
```
