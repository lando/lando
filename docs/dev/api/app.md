<a name="app"></a>

## app : <code>object</code>
Things Things Things Things Things Things Things Things Things Things
Things Things Things Things Things Things
Things Things Things Things Things Things Things Things
Things Things Things Things Things Things

**Kind**: global namespace  

* [app](#app) : <code>object</code>
    * [.list](#app.list) ⇒ <code>Array</code>
    * [.get](#app.get) ⇒ <code>number</code>
    * [.isRunning](#app.isRunning) ⇒ <code>number</code>
    * [.exists](#app.exists) ⇒ <code>number</code>
    * [.uninstall](#app.uninstall) ⇒ <code>number</code>
    * [.cleanup](#app.cleanup) ⇒ <code>number</code>
    * [.start](#app.start) ⇒ <code>number</code>
    * [.stop](#app.stop) ⇒ <code>number</code>
    * [.stop](#app.stop) ⇒ <code>number</code>
    * [.destroy](#app.destroy) ⇒ <code>number</code>
    * [.rebuild](#app.rebuild) ⇒ <code>number</code>
    * [.info()](#app.info) ⇒ <code>number</code>
        * ["pre-info"](#app.info.event_pre-info)
        * ["post-info"](#app.info.event_post-info)

<a name="app.list"></a>

### app.list ⇒ <code>Array</code>
Lists all the Lando apps

**Kind**: static namespace of [<code>app</code>](#app)  
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
<a name="app.get"></a>

### app.get ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.isRunning"></a>

### app.isRunning ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.exists"></a>

### app.exists ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.uninstall"></a>

### app.uninstall ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.cleanup"></a>

### app.cleanup ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.start"></a>

### app.start ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.stop"></a>

### app.stop ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.stop"></a>

### app.stop ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.destroy"></a>

### app.destroy ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.rebuild"></a>

### app.rebuild ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```
<a name="app.info"></a>

### app.info() ⇒ <code>number</code>
Adds three numbers.

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.4.0  
**Example**  
```js
add(6, 4)
// => 10
```

* [.info()](#app.info) ⇒ <code>number</code>
    * ["pre-info"](#app.info.event_pre-info)
    * ["post-info"](#app.info.event_post-info)

<a name="app.info.event_pre-info"></a>

#### "pre-info"
Snowball event.

**Kind**: event emitted by [<code>info</code>](#app.info)  
**Category**: events  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isPacked | <code>boolean</code> | Indicates whether the snowball is tightly packed. |

<a name="app.info.event_post-info"></a>

#### "post-info"
Snowball event.

**Kind**: event emitted by [<code>info</code>](#app.info)  
**Category**: events  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isPacked | <code>boolean</code> | Indicates whether the snowball is tightly packed. |

