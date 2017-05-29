## Members

<dl>
<dt><a href="#errorTags">errorTags</a></dt>
<dd><p>Small object for adding and getting error tags.</p>
</dd>
</dl>

## Objects

<dl>
<dt><a href="#error">error</a> : <code>object</code></dt>
<dd><p>Things Things Things Things Things Things Things Things Things Things
Things Things Things Things Things Things
Things Things Things Things Things Things Things Things
Things Things Things Things Things Things</p>
</dd>
</dl>

<a name="errorTags"></a>

## errorTags
Small object for adding and getting error tags.

**Kind**: global variable  
<a name="error"></a>

## error : <code>object</code>
Things Things Things Things Things Things Things Things Things Things
Things Things Things Things Things Things
Things Things Things Things Things Things Things Things
Things Things Things Things Things Things

**Kind**: global namespace  

* [error](#error) : <code>object</code>
    * [.handleError](#error.handleError) ⇒ <code>Array</code>
    * [.getStackTrace](#error.getStackTrace) ⇒ <code>Array</code>

<a name="error.handleError"></a>

### error.handleError ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>error</code>](#error)  
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
<a name="error.getStackTrace"></a>

### error.getStackTrace ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>error</code>](#error)  
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
