<a name="module_yaml"></a>

## yaml
Contains yaml functions.

**Todo:**: Better logging here?  
**Since**: 3.0.0  
**Example**  
```js
// Add a string to the cache
var thing = lando.yaml.load('/tmp/myfile.yml');
```

* [yaml](#module_yaml)
    * [.load(file)](#module_yaml.load) ⇒ <code>Object</code>
    * [.dump(file, data)](#module_yaml.dump)

<a name="module_yaml.load"></a>

### yaml.load(file) ⇒ <code>Object</code>
Loads a yaml object from a file

**Kind**: static method of [<code>yaml</code>](#module_yaml)  
**Returns**: <code>Object</code> - The loaded object  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |

**Example**  
```js
// Add a string to the cache
var thing = lando.yaml.load('/tmp/myfile.yml');
```
<a name="module_yaml.dump"></a>

### yaml.dump(file, data)
Dumps an object to a YAML file

**Kind**: static method of [<code>yaml</code>](#module_yaml)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |
| data | <code>Object</code> | The object to dump |

