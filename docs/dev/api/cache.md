<a name="cache"></a>

## cache : <code>object</code>
Things Things Things Things Things Things Things Things Things Things
Things Things Things Things Things Things
Things Things Things Things Things Things Things Things
Things Things Things Things Things Things

**Kind**: global namespace  

* [cache](#cache) : <code>object</code>
    * [.set](#cache.set) ⇒ <code>Array</code>
    * [.get](#cache.get) ⇒ <code>Array</code>
    * [.remove](#cache.remove) ⇒ <code>Array</code>

<a name="cache.set"></a>

### cache.set ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>cache</code>](#cache)  
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
<a name="cache.get"></a>

### cache.get ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>cache</code>](#cache)  
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
<a name="cache.remove"></a>

### cache.remove ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>cache</code>](#cache)  
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
