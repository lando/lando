<a name="module_bootstrap"></a>

## bootstrap
Contains the main bootstrap function.

**Since**: 3.0.0  
**Example**  
```js
// Initialize Lando in CLI mode
bootstrap({mode: 'cli'})

// Initialize CLI
.tap(function(lando) {
  return lando.cli.init(lando);
})
```

* [bootstrap](#module_bootstrap)
    * [.bootstrap](#module_bootstrap.bootstrap) ⇒ <code>Object</code>
    * ["event:pre-bootstrap"](#module_bootstrap.event_pre-bootstrap)
    * ["event:post-bootstrap"](#module_bootstrap.event_post-bootstrap)

<a name="module_bootstrap.bootstrap"></a>

### bootstrap.bootstrap ⇒ <code>Object</code>
The main bootstrap function.

This will:

  1. Instantiate the lando object.
  2. Emit bootstrap events
  3. Initialize plugins

**Kind**: static property of [<code>bootstrap</code>](#module_bootstrap)  
**Returns**: <code>Object</code> - An initialized Lando object  
**Emits**: <code>event:pre-bootstrap</code>, <code>event:post-bootstrap</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | Options to tweak the bootstrap |
| opts.mode | <code>String</code> | The mode to run the bootstrap with |

**Example**  
```js
// Get the bootstrap function
var bootstrap = require('./../lib/bootstrap.js');

// Return the app info
return lando.app.info(app)

// And print out any services with urls
.each(function(service) {
  if (_.has(service, 'urls')) {
    console.log(service.urls);
  }
});
```
<a name="module_bootstrap.event_pre-bootstrap"></a>

### "event:pre-bootstrap"
Event that allows other things to augment the lando global config.

This is useful so plugins can add additional config settings to the global
config.

**Kind**: event emitted by [<code>bootstrap</code>](#module_bootstrap)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The global Lando config |

**Example**  
```js
// Add engine settings to the config
lando.events.on('pre-bootstrap', function(config) {

  // Get the docker config
  var engineConfig = daemon.getEngineConfig();

  // Add engine host to the config
  config.engineHost = engineConfig.host;

});
```
<a name="module_bootstrap.event_post-bootstrap"></a>

### "event:post-bootstrap"
Event that allows other things to augment the lando object.

This is useful so plugins can add additional modules to lando before
the bootstrap is completed.

**Kind**: event emitted by [<code>bootstrap</code>](#module_bootstrap)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | <code>Object</code> | The Lando object |

**Example**  
```js
// Add the services module to lando
lando.events.on('post-bootstrap', function(lando) {
  lando.services = require('./services')(lando);
});
```
