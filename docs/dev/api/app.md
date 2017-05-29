## Objects

<dl>
<dt><a href="#app">app</a> : <code>object</code></dt>
<dd><p>Things Things Things Things Things Things Things Things Things Things
Things Things Things Things Things Things
Things Things Things Things Things Things Things Things
Things Things Things Things Things Things</p>
</dd>
</dl>

## Events

<dl>
<dt><a href="#event_pre-app-instantiate">"pre-app-instantiate"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_post-instantiate-app">"post-instantiate-app"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_app-ready">"app-ready"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_pre-info">"pre-info"</a></dt>
<dd><p>Snowball event.</p>
</dd>
<dt><a href="#event_post-info">"post-info"</a></dt>
<dd><p>Snowball event.</p>
</dd>
<dt><a href="#event_pre-uninstall">"pre-uninstall"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_post-uninstall">"post-uninstall"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_pre-start">"pre-start"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_post-start">"post-start"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_pre-stop">"pre-stop"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_post-start">"post-start"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_pre-destroy">"pre-destroy"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_post-destroy">"post-destroy"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_pre-rebuild">"pre-rebuild"</a></dt>
<dd><p>stuff guys</p>
</dd>
<dt><a href="#event_post-rebuild">"post-rebuild"</a></dt>
<dd><p>stuff guys</p>
</dd>
</dl>

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
    * [.info](#app.info) ⇒ <code>number</code>
    * [.uninstall](#app.uninstall) ⇒ <code>number</code>
    * [.cleanup](#app.cleanup) ⇒ <code>number</code>
    * [.start](#app.start) ⇒ <code>number</code>
    * [.stop](#app.stop) ⇒ <code>number</code>
    * [.stop](#app.stop) ⇒ <code>number</code>
    * [.destroy](#app.destroy) ⇒ <code>number</code>
    * [.rebuild](#app.rebuild) ⇒ <code>number</code>

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
<a name="app.info"></a>

### app.info ⇒ <code>number</code>
Adds three numbers.

**Kind**: static namespace of [<code>app</code>](#app)  
**Returns**: <code>number</code> - Returns the total.  
**Since**: 3.0.0  
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
<a name="event_pre-app-instantiate"></a>

## "pre-app-instantiate"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post-instantiate-app"></a>

## "post-instantiate-app"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_app-ready"></a>

## "app-ready"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre-info"></a>

## "pre-info"
Snowball event.

**Kind**: event emitted  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isPacked | <code>boolean</code> | Indicates whether the snowball is tightly packed. |

<a name="event_post-info"></a>

## "post-info"
Snowball event.

**Kind**: event emitted  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isPacked | <code>boolean</code> | Indicates whether the snowball is tightly packed. |

<a name="event_pre-uninstall"></a>

## "pre-uninstall"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post-uninstall"></a>

## "post-uninstall"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre-start"></a>

## "pre-start"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post-start"></a>

## "post-start"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre-stop"></a>

## "pre-stop"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post-start"></a>

## "post-start"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre-destroy"></a>

## "pre-destroy"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post-destroy"></a>

## "post-destroy"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre-rebuild"></a>

## "pre-rebuild"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post-rebuild"></a>

## "post-rebuild"
stuff guys

**Kind**: event emitted  
**Since**: 3.0.0  
