<a name="module_networks"></a>

## networks
Contains ways to interact with docker networks.

**Since**: 3.0.0  
**Example**  
```js
// Get the networks
return lando.networks.get()

// Print the networks
.then(function(networks) {
  console.log(networks);
});
```
<a name="module_networks.get"></a>

### networks.get([opts]) ⇒ <code>Promise</code>
Gets the docker networks.

**Kind**: static method of [<code>networks</code>](#module_networks)  
**Returns**: <code>Promise</code> - A Promise with an array of network objects.  
**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Options to pass into the docker networks call |
| [opts.filters] | <code>Object</code> | Filters options |

**Example**  
```js
// Options to filter the networks
 var opts = {
   filters: {
     driver: {bridge: true},
     name: {_default: true}
   }
 };

 // Get the networks
 return lando.networks.get(opts)

 // Filter out lando_default
 .filter(function(network) {
   return network.Name !== 'lando_default';
 })

 // Map to list of network names
 .map(function(network) {
   return network.Name;
 });
```
