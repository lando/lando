<a name="lando.updates.updateAvailable"></a>

## lando.updates.updateAvailable(version1, version2) ⇒ <code>Boolean</code>
Compares two versions and determines if an update is available or not

**Kind**: global function  
**Returns**: <code>Boolean</code> - Whether an update is avaiable.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| version1 | <code>String</code> | The current version. |
| version2 | <code>String</code> | The potential update version |

**Example**  
```js
// Does our current version need to be updated?
const updateAvailable = lando.updates.updateAvailable('1.0.0', '1.0.1');
```
<a name="lando.updates.fetch"></a>

## lando.updates.fetch(data) ⇒ <code>Boolean</code>
Determines whether we need to fetch updatest or not

**Kind**: global function  
**Returns**: <code>Boolean</code> - Whether we need to ping GitHub for new data or not  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Cached update data |

<a name="lando.updates.refresh"></a>

## lando.updates.refresh(version) ⇒ <code>Object</code>
Get latest version info from github

**Kind**: global function  
**Returns**: <code>Object</code> - Update data  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>String</code> | Lando version to use as a fallback |

