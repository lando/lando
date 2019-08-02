<a name="lando.error.handle"></a>

## lando.error.handle() ⇒ <code>Object</code>
Returns the lando options

This means all the options passed in before the `--` flag.

**Kind**: global function  
**Returns**: <code>Object</code> - Yarg parsed options  
**Since**: 3.0.0  
**Todo**

- [ ] make this static and then fix all call sites

**Example**  
```js
// Gets all the pre-global options that have been specified.
const argv = lando.tasks.argv();
```
