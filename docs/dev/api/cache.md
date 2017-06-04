<a name="module_cache"></a>

## cache
Contains caching functions.

**Since**: 3.0.0  
**Example**  
```js
// Add an item to the cache
lando.cache.set('mykey', data);

// Get an item from the cache
var value = lando.cache.get('mykey');

// Remove an item from the cache
lando.cache.remove('mykey');
```

* [cache](#module_cache)
    * [.set(key, data, [opts])](#module_cache.set)
    * [.get(key)](#module_cache.get) ⇒ <code>Any</code>
    * [.remove(key)](#module_cache.remove)

<a name="module_cache.set"></a>

### cache.set(key, data, [opts])
Sets an item in the cache

**Kind**: static method of [<code>cache</code>](#module_cache)  
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
<a name="module_cache.get"></a>

### cache.get(key) ⇒ <code>Any</code>
Gets an item in the cache

**Kind**: static method of [<code>cache</code>](#module_cache)  
**Returns**: <code>Any</code> - The data stored in the cache if applicable.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to retrieve the data. |

**Example**  
```js
// Get the data stored with key mykey
var data = lando.cache.get('mykey');
```
<a name="module_cache.remove"></a>

### cache.remove(key)
Manually remove an item from the cache.

**Kind**: static method of [<code>cache</code>](#module_cache)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to remove the data. |

**Example**  
```js
// Remove the data stored with key mykey
lando.cache.remove('mykey');
```
