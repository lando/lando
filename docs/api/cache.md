<a id="landocacheset"></a>

<h2 id="landocacheset" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.set(key, data, [opts])</h2>
<div class="api-body-header"></div>

Sets an item in the cache

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>String</code> |  | The name of the key to store the data with. |
| data | <code>Any</code> |  | The data to store in the cache. |
| [opts] | <code>Object</code> |  | Options to pass into the cache |
| [opts.persist] | <code>Boolean</code> | <code>false</code> | Whether this cache data should persist between processes. Eg in a file instead of memory |
| [opts.ttl] | <code>Integer</code> | <code>0</code> | Seconds the cache should live. 0 mean forever. |

**Example**  
```js
// Add a string to the cache
lando.cache.set('mykey', 'mystring');

// Add an object to persist in the file cache
lando.cache.set('mykey', data, {persist: true});

// Add an object to the cache for five seconds
lando.cache.set('mykey', data, {ttl: 5});
```
<div class="api-body-footer"></div>
<a id="landocacheget"></a>

<h2 id="landocacheget" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.get(key) ⇒ <code>Any</code></h2>
<div class="api-body-header"></div>

Gets an item in the cache

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to retrieve the data. |

**Returns**: <code>Any</code> - The data stored in the cache if applicable.  
**Example**  
```js
// Get the data stored with key mykey
const data = lando.cache.get('mykey');
```
<div class="api-body-footer"></div>
<a id="landocacheremove"></a>

<h2 id="landocacheremove" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.remove(key)</h2>
<div class="api-body-header"></div>

Manually remove an item from the cache.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to remove the data. |

**Example**  
```js
// Remove the data stored with key mykey
lando.cache.remove('mykey');
```
<div class="api-body-footer"></div>
