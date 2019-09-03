<a name="lando.cache.set"></a>

## lando.cache.set(key, data, [opts])
Sets an item in the cache

**Kind**: global function  
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
<a name="lando.cache.get"></a>

## lando.cache.get(key) ⇒ <code>Any</code>
Gets an item in the cache

**Kind**: global function  
**Returns**: <code>Any</code> - The data stored in the cache if applicable.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to retrieve the data. |

**Example**  
```js
// Get the data stored with key mykey
const data = lando.cache.get('mykey');
```
<a name="lando.cache.remove"></a>

## lando.cache.remove(key)
Manually remove an item from the cache.

**Kind**: global function  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to remove the data. |

**Example**  
```js
// Remove the data stored with key mykey
lando.cache.remove('mykey');
```
