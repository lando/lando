<a name="lando.yaml.load"></a>

## lando.yaml.load(file) ⇒ <code>Object</code>
Loads a yaml object from a file.

**Kind**: global function  
**Returns**: <code>Object</code> - The loaded object  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |

**Example**  
```js
// Add a string to the cache
const thing = lando.yaml.load('/tmp/myfile.yml');
```
<a name="lando.yaml.dump"></a>

## lando.yaml.dump(file, data) ⇒ <code>String</code>
Dumps an object to a YAML file

**Kind**: global function  
**Returns**: <code>String</code> - Flename  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |
| data | <code>Object</code> | The object to dump |

