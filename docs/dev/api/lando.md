<a name="lando"></a>

## lando : <code>object</code>
Things Things Things Things Things Things Things Things Things Things
Things Things Things Things Things Things
Things Things Things Things Things Things Things Things
Things Things Things Things Things Things

**Kind**: global namespace  
<a name="lando.app"></a>

### lando.app ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>lando</code>](#lando)  
**Returns**: <code>Array</code> - Returns the total.  
**See**: [app.md](app.md)  
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
