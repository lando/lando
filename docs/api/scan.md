<a name="lando.scanUrls"></a>

## lando.scanUrls(urls, [opts]) ⇒ <code>Array</code>
Scans URLs to determine if they are up or down.

**Kind**: global function  
**Returns**: <code>Array</code> - An array of objects of the form {url: url, status: true|false}  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| urls | <code>Array</code> |  | An array of urls like `https://mysite.lndo.site` or `https://localhost:34223` |
| [opts] | <code>Object</code> |  | Options to configure the scan. |
| [opts.max] | <code>Integer</code> | <code>7</code> | The amount of times to retry accessing each URL. |
| [opts.waitCode] | <code>Array</code> | <code>[400, 502, 404]</code> | The HTTP codes to prompt a retry. |

**Example**  
```js
// Scan URLs and print results
return lando.utils.scanUrls(['http://localhost', 'https://localhost'])
.then(function(results) {
  console.log(results);
});
```
