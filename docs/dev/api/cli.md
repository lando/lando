<a name="cli"></a>

## cli : <code>object</code>
Things Things Things Things Things Things Things Things Things Things
Things Things Things Things Things Things
Things Things Things Things Things Things Things Things
Things Things Things Things Things Things

**Kind**: global namespace  

* [cli](#cli) : <code>object</code>
    * [.startHeader](#cli.startHeader) ⇒ <code>Array</code>
    * [.Table](#cli.Table) ⇒ <code>Array</code>
    * [.init](#cli.init) ⇒ <code>Array</code>

<a name="cli.startHeader"></a>

### cli.startHeader ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>cli</code>](#cli)  
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
<a name="cli.Table"></a>

### cli.Table ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>cli</code>](#cli)  
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
<a name="cli.init"></a>

### cli.init ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>cli</code>](#cli)  
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
