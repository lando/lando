<a name="module_config"></a>

## config
Helpers to build the initialization configuration.

These are meant to be used to help your entrypoint script build a config
object

**Since**: 3.0.0  
**Example**  
```js
// Get the config helpers
var config = require('./config');
```

* [config](#module_config)
    * _static_
        * [.merge()](#module_config.merge)
        * [.updatePath(dir)](#module_config.updatePath) ⇒ <code>String</code>
        * [.stripEnv(prefix)](#module_config.stripEnv) ⇒ <code>Object</code>
    * _inner_
        * [~getSysConfRoot()](#module_config..getSysConfRoot)

<a name="module_config.merge"></a>

### config.merge()
Uses _.mergeWith to concat arrays, this helps replicate how Docker
Compose merges its things

**Kind**: static method of [<code>config</code>](#module_config)  
**Since**: 3.0.0  
**Example**  
```js
// Take an object and write a docker compose file
var newObject = _.mergeWith(a, b, lando.utils.merger);
```
<a name="module_config.updatePath"></a>

### config.updatePath(dir) ⇒ <code>String</code>
Updates the PATH with dir. This adds dir to the beginning of PATH.

**Kind**: static method of [<code>config</code>](#module_config)  
**Returns**: <code>String</code> - Updated PATH string  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>String</code> | The dir to add |

**Example**  
```js
// Update the path
var config.path = config.updatePath(path);
```
<a name="module_config.stripEnv"></a>

### config.stripEnv(prefix) ⇒ <code>Object</code>
Strips process.env of all envvars with PREFIX

**Kind**: static method of [<code>config</code>](#module_config)  
**Returns**: <code>Object</code> - Updated process.env  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>String</code> | The prefix to strip |

**Example**  
```js
// Reset the process.env without any LANDO_ prefixed envvars
process.env = config.stripEnv('LANDO_');
```
<a name="module_config..getSysConfRoot"></a>

### config~getSysConfRoot()
Document

**Kind**: inner method of [<code>config</code>](#module_config)  
