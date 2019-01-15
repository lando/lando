<a id="landoerrorhandle"></a>

<h2 id="landoerrorhandle" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.error.handle() ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Returns the lando options

This means all the options passed in before the `--` flag.

**Since**: 3.0.0  
**Todo**

- [ ] make this static and then fix all call sites

**Returns**: <code>Object</code> - Yarg parsed options  
**Example**  
```js
// Gets all the pre-global options that have been specified.
const argv = lando.tasks.argv();
```
<div class="api-body-footer"></div>
