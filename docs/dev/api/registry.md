<a name="module_registry"></a>

## registry
Contains functions to interact with the appRegistry.

**Since**: 3.0.0  
**Example**  
```js
// Register an app
return lando.registry.register({name: app.name, dir: app.root});

// Return the apps in the registry
return lando.registry.getApps();

// Return apps that might be in a bad state
return lando.registry.getBadApps();

// Remove from the registry
return lando.registry.remove({name: app.name});
```

* [registry](#module_registry)
    * [.getApps([opts])](#module_registry.getApps) ⇒ <code>Promise</code>
    * [.getBadApps()](#module_registry.getBadApps) ⇒ <code>Promise</code>
    * [.register(app)](#module_registry.register) ⇒ <code>Promise</code>
    * [.remove(app)](#module_registry.remove) ⇒ <code>Promise</code>

<a name="module_registry.getApps"></a>

### registry.getApps([opts]) ⇒ <code>Promise</code>
Gets a list of apps from the appRegistry

**Kind**: static method of [<code>registry</code>](#module_registry)  
**Returns**: <code>Promise</code> - A Promise with an array of returned apps.  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> |  | Options to determine how we get the apps. |
| [opts.useCache] | <code>Boolean</code> | <code>true</code> | Whether we should grab the appRegistry from cache or regenerate it. |

**Example**  
```js
// Regenerate the registry, return the list and print it
return lando.registry.getApps({useCache: false})

// Print the list
.then(function(apps) {
  console.log(apps);
})
```
<a name="module_registry.getBadApps"></a>

### registry.getBadApps() ⇒ <code>Promise</code>
Gets a list of apps from the appRegistry that might be in a bad state.

**Kind**: static method of [<code>registry</code>](#module_registry)  
**Returns**: <code>Promise</code> - A Promise with an array of returned bad apps.  
**Since**: 3.0.0  
**Example**  
```js
// Return the bad list and print it
return lando.registry.getBadApps()

// Print the list
.then(function(apps) {
  console.log(apps);
})
```
<a name="module_registry.register"></a>

### registry.register(app) ⇒ <code>Promise</code>
Adds an app to the app registry.

**Kind**: static method of [<code>registry</code>](#module_registry)  
**Returns**: <code>Promise</code> - A Promise  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | The app to add |
| app.name | <code>String</code> | The name of the app. |
| app.dir | <code>String</code> | The absolute path to this app's lando.yml file. |
| [app.data] | <code>Object</code> | Optional metadata |

**Example**  
```js
// Define an app with some additional and optional metadata
var app = {
  name: 'starfleet.mil',
  dir: '/Users/picard/Desktop/lando/starfleet',
  data: {
    warpfactor: 9
  }
};

// Register the app
return lando.registry.register(app);
```
<a name="module_registry.remove"></a>

### registry.remove(app) ⇒ <code>Promise</code>
Removes an app from the app registry.

**Kind**: static method of [<code>registry</code>](#module_registry)  
**Returns**: <code>Promise</code> - A Promise  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | The app to remove |
| app.name | <code>String</code> | The name of the app. |
| app.dir | <code>String</code> | The absolute path to this app's lando.yml file. |

**Example**  
```js
// Define an app with some additional and optional metadata
var app = {
  name: 'starfleet.mil',
  dir: '/Users/picard/Desktop/lando/starfleet'
};

// Remove the app
return lando.registry.remove(app);
```
