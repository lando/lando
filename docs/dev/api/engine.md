<a name="module_engine"></a>

## engine
Contains methods and events related to engine actions.

This module acts as an interface to all the relevant level docker things. Such
as:

 1. Configurating and managing the docker engine
 2. Routing requests to the docker api
 3. Routing requests to docker compose

**Emits**: <code>event:pre-bootstrap</code>  
**Since**: 3.0.0  
**Example**  
```js
// Activate the docker engine
return lando.engine.up();

// Start an app
return lando.app.start(app)

// and then print a success message
.then(function() {
  console.log('App started!');
 });
```
