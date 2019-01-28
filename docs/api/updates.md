<a id="landoupdatesupdateavailable"></a>

<h2 id="landoupdatesupdateavailable" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.updates.updateAvailable(version1, version2) ⇒ <code>Boolean</code></h2>
<div class="api-body-header"></div>

Compares two versions and determines if an update is available or not

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| version1 | <code>String</code> | The current version. |
| version2 | <code>String</code> | The potential update version |

**Returns**: <code>Boolean</code> - Whether an update is avaiable.  
**Example**  
```js
// Does our current version need to be updated?
const updateAvailable = lando.updates.updateAvailable('1.0.0', '1.0.1');
```
<div class="api-body-footer"></div>
<a id="landoupdatesfetch"></a>

<h2 id="landoupdatesfetch" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.updates.fetch(data) ⇒ <code>Boolean</code></h2>
<div class="api-body-header"></div>

Determines whether we need to fetch updatest or not

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Cached update data |

**Returns**: <code>Boolean</code> - Whether we need to ping GitHub for new data or not  
<div class="api-body-footer"></div>
<a id="landoupdatesrefresh"></a>

<h2 id="landoupdatesrefresh" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.updates.refresh(version) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Get latest version info from github

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>String</code> | Lando version to use as a fallback |

**Returns**: <code>Object</code> - Update data  
<div class="api-body-footer"></div>
