<a name="module_utils"></a>

## utils
Contains utility functions.

**Since**: 3.0.0  
**Example**  
```js
// Take an object and write a docker compose file
var filename = lando.utils.compose(filename, data);

// Scan URLs and print results
return lando.utils.scanUrls(urls)
.then(function(results) {
  console.log(results);
});
```

* [utils](#module_utils)
    * [.dockerComposify()](#module_utils.dockerComposify)
    * [.merger()](#module_utils.merger)
    * [.compose(file, data)](#module_utils.compose) ⇒ <code>String</code>
    * [.scanUrls(urls, [opts])](#module_utils.scanUrls) ⇒ <code>Array</code>

<a name="module_utils.dockerComposify"></a>

### utils.dockerComposify()
Translate a name for use by docker-compose eg strip `-` and `.` and

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Todo:**: possibly more than that  
**Since**: 3.0.0  
<a name="module_utils.merger"></a>

### utils.merger()
Used with _.mergeWith to concat arrays

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Since**: 3.0.0  
**Example**  
```js
// Take an object and write a docker compose file
var newObject = _.mergeWith(a, b, lando.utils.merger);
```
<a name="module_utils.compose"></a>

### utils.compose(file, data) ⇒ <code>String</code>
Writes a docker compose object to a file.

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Returns**: <code>String</code> - The absolute path to the destination file.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The absolute path to the destination file. |
| data | <code>Object</code> | The data to write to the file. |

**Example**  
```js
// Take an object and write a docker compose file
var filename = lando.utils.compose(filename, data);
```
<a name="module_utils.scanUrls"></a>

### utils.scanUrls(urls, [opts]) ⇒ <code>Array</code>
Scans URLs to determine if they are up or down.

**Kind**: static method of [<code>utils</code>](#module_utils)  
**Returns**: <code>Array</code> - An array of objects of the form {url: url, status: true|false}  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| urls | <code>Array</code> |  | An array of urls like `https://mysite.lndo.site` or `https://localhost:34223` |
| [opts] | <code>Object</code> |  | Options to configure the scan. |
| [opts.max] | <code>Integer</code> | <code>7</code> | The amount of times to retry accessing each URL. |
| [opts.waitCode] | <code>Array</code> | <code>[400, 502</code> | The HTTP codes to prompt a retry. |

**Example**  
```js
// Scan URLs and print results
return lando.utils.scanUrls(['http://localhost', 'https://localhost'])
.then(function(results) {
  console.log(results);
});
```
