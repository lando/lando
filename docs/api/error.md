<a name="lando.error.handle"></a>

## lando.error.handle(error, report) ⇒ <code>Integer</code>
Returns the lando options

This means all the options passed in before the `--` flag.

**Kind**: global function  
**Returns**: <code>Integer</code> - the error code  
**Since**: 3.0.0  
**Todo**

- [ ] make this static and then fix all call sites


| Param | Type | Description |
| --- | --- | --- |
| error | <code>Object</code> | Error object |
| report | <code>Boolean</code> | Whether to report the error or not |

**Example**  
```js
// Gets all the pre-global options that have been specified.
const argv = lando.tasks.argv();
```
