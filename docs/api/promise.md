<a name="lando.Promise.retry"></a>

## lando.Promise.retry(fn, [opts]) ⇒ <code>Promise</code>
Adds a retry method to all Promise instances.

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | The function to retry. |
| [opts] | <code>Opts</code> |  | Options to specify how retry works. |
| [opts.max] | <code>Integer</code> | <code>5</code> | The amount of times to retry. |
| [opts.backoff] | <code>Integer</code> | <code>500</code> | The amount to wait between retries. In miliseconds and cumulative. |

**Example**  
```js
// And then retry 25 times until we've connected, increase delay between retries by 1 second
Promise.retry(someFunction, {max: 25, backoff: 1000});
```
<a name="lando.Promise"></a>

## lando.Promise()
Extends [bluebird](http://bluebirdjs.com/docs/api-reference.html)
so that our promises have some retry functionality.

All functionality should be the same as bluebird except where indicated
below

Note that bluebird currently wants you to use scoped prototypes to extend
it rather than the normal extend syntax so that is why this is using the "old"
way

**Kind**: global function  
**See**

- http://bluebirdjs.com/docs/api-reference.html
- https://github.com/petkaantonov/bluebird/issues/1397

