<a id="landoyamlload"></a>

<h2 id="landoyamlload" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.load(file) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Loads a yaml object from a file.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |

**Returns**: <code>Object</code> - The loaded object  
**Example**  
```js
// Add a string to the cache
const thing = lando.yaml.load('/tmp/myfile.yml');
```
<div class="api-body-footer"></div>
<a id="landoyamldump"></a>

<h2 id="landoyamldump" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.dump(file, data) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Dumps an object to a YAML file

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |
| data | <code>Object</code> | The object to dump |

**Returns**: <code>String</code> - Flename  
<div class="api-body-footer"></div>
