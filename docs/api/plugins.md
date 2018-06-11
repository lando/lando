<a id="landoappregister"></a>

<h2 id="landoappregister" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.register(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Adds an app to the app registry.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | The app to add |
| app.name | <code>String</code> | The name of the app. |
| app.dir | <code>String</code> | The absolute path to this app's lando.yml file. |
| [app.data] | <code>Object</code> | Optional metadata |

**Returns**: <code>Promise</code> - A Promise  
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
<div class="api-body-footer"></div>
<a id="landoappunregister"></a>

<h2 id="landoappunregister" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.unregister(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Removes an app from the app registry.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | The app to remove |
| app.name | <code>String</code> | The name of the app. |
| app.dir | <code>String</code> | The absolute path to this app's lando.yml file. |

**Returns**: <code>Promise</code> - A Promise  
**Example**  
```js
// Define an app with some additional and optional metadata
var app = {
  name: 'starfleet.mil',
  dir: '/Users/picard/Desktop/lando/starfleet'
};

// Remove the app
return lando.unregister(app);
```
<div class="api-body-footer"></div>
<a id="landoapplist"></a>

<h2 id="landoapplist" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.list() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Lists all the Lando apps from the app registry.

**Since**: 3.0.0  
**Returns**: <code>Promise</code> - Returns a Promise with an array of apps from the registry  
**Example**  
```js
// List all the apps
return lando.app.list()

// Pretty print each app to the console.
.map(function(app) {
  console.log(JSON.stringify(app, null, 2));
});
```
<div class="api-body-footer"></div>
<a id="landoappget"></a>

<h2 id="landoappget" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.get([appName]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Gets a fully instantiated app object.

If you do not pass in an `appName` Lando will attempt to find an app in your
current working directory.

Lando will also scan parent directories if no app is found.

**Emits**: [<code>pre_instantiate_app</code>](#event_pre_instantiate_app), [<code>post_instantiate_app</code>](#event_post_instantiate_app), [<code>app_ready</code>](#event_app_ready)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [appName] | <code>String</code> | The name of the app to get. |

**Returns**: <code>Promise</code> - Returns a Pronise with an instantiated app object or nothing.  
**Example**  
```js
// Get an app named myapp and start it
return lando.app.get('myapp')

// Start the app
.then(function(app) {
  lando.app.start(app);
});
```
<div class="api-body-footer"></div>
<a id="landoappisrunning"></a>

<h2 id="landoappisrunning" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.isRunning(app, checkall) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Determines whether an app is running or not. By defualt it only requires
that a single service for that be running to return true but see opts below.

You can pass in an entire app object here but it really just needs an object
with the app name eg {name: 'myapp'}

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | An app object. |
| app.name | <code>String</code> | The name of the app |
| checkall | <code>Boolean</code> | Make sure ALL the apps containers are running |

**Returns**: <code>Promise</code> - Returns a Promise with a boolean of whether the app is running or not.  
**Example**  
```js
// Let's check to see if the app has been started
return lando.app.isRunning(app)

// Start the app if its not running already
.then(function(isRunning) {
  if (!isRunning) {
    return lando.app.start(app);
  }
});
```
<div class="api-body-footer"></div>
<a id="landoappexists"></a>

<h2 id="landoappexists" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.exists(appName) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Checks to see if the app exists or not.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>String</code> | The name of the app to get. |

**Returns**: <code>Promise</code> - A promise with a boolean of whether the app exists or not.  
**Example**  
```js
// Get an app named myapp and start it
return lando.app.exists('myapp')

// Theorize if app exists
.then(function(exists) {
  if (exists) {
    console.log('I think, therefore I am.')
  }
});
```
<div class="api-body-footer"></div>
<a id="landoappinfo"></a>

<h2 id="landoappinfo" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.info(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Prints useful information about the app's services.

This should return information about the services the app is running,
URLs the app can be accessed at, relevant connection information like database
credentials and any other information that is added by other plugins.

**Emits**: [<code>pre_info</code>](#event_pre_info), [<code>post_info</code>](#event_post_info)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise with an object of information about the app keyed by its services  
**Example**  
```js
// Return the app info
return lando.app.info(app)

// And print out any services with urls
.each(function(service) {
  if (_.has(service, 'urls')) {
    console.log(service.urls);
  }
});
```
<div class="api-body-footer"></div>
<a id="landoappuninstall"></a>

<h2 id="landoappuninstall" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.uninstall(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Soft removes the apps services but maintains persistent data like app volumes.

This differs from `destroy` in that destroy will hard remove all app services,
volumes, networks, etc as well as remove the app from the appRegistry.

**Emits**: [<code>pre_uninstall</code>](#event_pre_uninstall), [<code>post_uninstall</code>](#event_post_uninstall)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Uninstall the app
return lando.app.uninstall(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<div class="api-body-footer"></div>
<a id="landoappcleanup"></a>

<h2 id="landoappcleanup" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.cleanup() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Does some helpful cleanup before running an app operation.

This command helps clean up apps in an inconsistent state and any orphaned
containers they may have.

**Since**: 3.0.0  
**Todo**

- [ ] Should this be an internal method? Or can we deprecate at some point?

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Do the app cleanup
return lando.app.cleanup()
```
<div class="api-body-footer"></div>
<a id="landoappstart"></a>

<h2 id="landoappstart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.start(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Starts an app.

This will start up all services/containers that have been defined for this app.

**Emits**: [<code>pre_start</code>](#event_pre_start), [<code>post_start</code>](#event_post_start)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Start the app
return lando.app.start(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<div class="api-body-footer"></div>
<a id="landoappstop"></a>

<h2 id="landoappstop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.stop(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Stops an app.

This will stop all services/containers that have been defined for this app.

**Emits**: [<code>pre_stop</code>](#event_pre_stop), [<code>post_stop</code>](#event_post_stop)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Stop the app
return lando.app.stop(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<div class="api-body-footer"></div>
<a id="landoapprestart"></a>

<h2 id="landoapprestart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.restart(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Stops and then starts an app.

This just runs `app.stop` and `app.start` in succession.

**Emits**: [<code>pre_stop</code>](#event_pre_stop), [<code>post_stop</code>](#event_post_stop), [<code>pre_start</code>](#event_pre_start), [<code>post_start</code>](#event_post_start)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Restart the app
return lando.app.restart(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<div class="api-body-footer"></div>
<a id="landoappdestroy"></a>

<h2 id="landoappdestroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.destroy(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Hard removes all app services, olumes, networks, etc as well as removes the
app from the appRegistry.

This differs from `uninstall` in that uninstall will only soft remove all app
services, while maintaining things like volumes, networks, etc as well as an
entry in the appRegistry.

That said this DOES call both `stop` and `uninstall`.

**Emits**: [<code>pre_destroy</code>](#event_pre_destroy), [<code>pre_stop</code>](#event_pre_stop), [<code>post_stop</code>](#event_post_stop), [<code>pre_uninstall</code>](#event_pre_uninstall), [<code>post_uninstall</code>](#event_post_uninstall), [<code>post_destroy</code>](#event_post_destroy)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Destroy the app
return lando.app.destroy(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<div class="api-body-footer"></div>
<a id="landoapprebuild"></a>

<h2 id="landoapprebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.rebuild(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Rebuilds an app.

This will stop an app, soft remove its services, rebuild those services and
then, finally, start the app back up again. This is useful for developers who
might want to tweak Dockerfiles or compose yamls.

**Emits**: [<code>pre_stop</code>](#event_pre_stop), [<code>post_stop</code>](#event_post_stop), [<code>pre_uninstall</code>](#event_pre_uninstall), [<code>post_uninstall</code>](#event_post_uninstall), [<code>pre_start</code>](#event_pre_start), [<code>post_start</code>](#event_post_start)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Rebuild the app
return lando.app.rebuild(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<div class="api-body-footer"></div>
<a id="landoengineisinstalled"></a>

<h2 id="landoengineisinstalled" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.isInstalled() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Determines whether the docker engine is installed or not

**Since**: 3.0.0  
**Returns**: <code>Promise</code> - A Promise with a boolean containing the installed status.  
<div class="api-body-footer"></div>
<a id="landoengineisup"></a>

<h2 id="landoengineisup" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.isUp() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Determines whether the docker engine is up or not.

**Since**: 3.0.0  
**Todo**

- [ ] Does this need to be publically exposed still?

**Returns**: <code>Promise</code> - A Promise with a boolean containing the engine up status.  
**Example**  
```js
// Start the engine if it is not up
return lando.engine.isUp()

// Check if we need to start
.then(function(isUp) {
  if (!isUp) {
    return lando.engine.up();
  }
});
```
<div class="api-body-footer"></div>
<a id="landoengineup"></a>

<h2 id="landoengineup" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.up() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Tries to activate the docker engine/daemon.

Generally the engine will be up and active, but if it isn't for whatever reason
Lando will try to start it.

NOTE: Most commands that require the docker engine to be up will automatically
call this anyway.

**Emits**: [<code>pre_engine_up</code>](#event_pre_engine_up), [<code>post_engine_up</code>](#event_post_engine_up)  
**Since**: 3.0.0  
**Todo**

- [ ] Does this need to be publically exposed still?

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<div class="api-body-footer"></div>
<a id="landoenginedown"></a>

<h2 id="landoenginedown" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.down() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Tries to deactivate the docker engine/daemon.

NOTE: Most commands that require the docker engine to be up will automatically
call this anyway.

**Emits**: [<code>pre_engine_down</code>](#event_pre_engine_down), [<code>post_engine_down</code>](#event_post_engine_down)  
**Since**: 3.0.0  
**Todo**

- [ ] Does this need to be publically exposed still?

**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="landoengineisrunning"></a>

<h2 id="landoengineisrunning" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.isRunning(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Determines whether a container is running or not

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | An ID that docker can recognize such as the container id or name. |

**Returns**: <code>Promise</code> - A Promise with a boolean of whether the container is running or not  
**Example**  
```js
// Check to see if our app's web service is running
return lando.engine.isRunning('myapp_web_1')

// Log the running status of the container
.then(isRunning) {
  lando.log.info('Container %s is running: %s', 'myapp_web_1', isRunning);
});
```
<div class="api-body-footer"></div>
<a id="landoenginelist"></a>

<h2 id="landoenginelist" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.list([data]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Lists all the Lando containers. Optionally filter by app name.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [data] | <code>String</code> | An appname to filter the containers by. |

**Returns**: <code>Promise</code> - A Promise with an Array of container Objects.  
**Example**  
```js
// List all the lando containers
return lando.engine.list()

// Log each container
.each(function(container) {
  lando.log.info(container);
});
```
<div class="api-body-footer"></div>
<a id="landoengineexists"></a>

<h2 id="landoengineexists" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.exists(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Checks whether a specific service exists or not.

There are two ways to check whether a container exists:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Search criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> | An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> | An Array of paths to Docker compose files |
| data.project | <code>String</code> | A String of the project name (Usually this is the same as the app name) |
| data.opts | <code>Object</code> | Options on what service to check |
| data.opts.services | <code>Array</code> | An Array of services to check |

**Returns**: <code>Promise</code> - A Promise with a Boolean of whether the service exists or not.  
**Example**  
```js
// Check whether a service exists by container id
return lando.engine.exists({name: 'myapp_web_1'})

// Log whether it exists
.then(function(exists) {
  lando.log.info('Container exists: %s', exists);
});

// Check whether a service exists by compose/app object
// Assume we have an `app` object called `app` already.

// Add the services options
var compose = app;
compose.opts = {
  services: ['web']
};

// Check existence
return lando.engine.exists(compose);
```
<div class="api-body-footer"></div>
<a id="landoenginescan"></a>

<h2 id="landoenginescan" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.scan(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Returns comprehensive service metadata. This is a wrapper around `docker inspect`.

There are two ways to get container metadata:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Search criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> | An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> | An Array of paths to Docker compose files |
| data.project | <code>String</code> | A String of the project name (Usually this is the same as the app name) |
| data.opts | <code>Object</code> | Options on what service to scan |
| data.opts.services | <code>Array</code> | An Array of services to scan. |

**Returns**: <code>Promise</code> - A Promise with an Object of service metadata.  
**Example**  
```js
// Log scan data using an id
return lando.engine.scan({id: '146d321f212d'})
.then(function(data) {
  lando.log.info('Container data is %j', data);
});

// Log service data by compose/app object
// Assume we have an `app` object called `app` already.

// Add the services options
var compose = app;
compose.opts = {
  services: ['web']
};

// scan the service
return lando.engine.scan(compose);
```
<div class="api-body-footer"></div>
<a id="landoenginestart"></a>

<h2 id="landoenginestart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.start(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Starts the containers/services for the specified `compose` object.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_start</code>](#event_pre_engine_start), [<code>post_engine_start</code>](#event_post_engine_start)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A `compose` Object or an Array of `compose` Objects if you want to start more than one set of services. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to start the `compose` Objects containers. |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | The services to start. |
| [data.opts.background] | <code>Boolean</code> | <code>true</code> | Start the services in the background. |
| [data.opts.recreate] | <code>Boolean</code> | <code>false</code> | Recreate the services. |
| [data.opts.removeOrphans] | <code>Boolean</code> | <code>true</code> | Remove orphaned containers. |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Start up all the containers for given app object `app`
return lando.engine.start(app);

// Start and recreate specific services for an `app`
app.opts = {
  recreate: true,
  services: ['web', 'database']
};

return lando.engine.start(app);
```
<div class="api-body-footer"></div>
<a id="landoenginerun"></a>

<h2 id="landoenginerun" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.run(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Runs a command on a given service/container. This is a wrapper around `docker exec`.

UNTIL the resolution of https://github.com/apocas/docker-modem/issues/83 data needs to also be or be an
array of compose objects for this to work correctly on Windows as well. See some of the other engine
documentation for what a compose object looks like.

**Emits**: [<code>pre_engine_run</code>](#event_pre_engine_run), [<code>post_engine_run</code>](#event_post_engine_run)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A run Object or an Array of run Objects if you want to run more tha one command. |
| data.id | <code>String</code> |  | The container to run the command on. Must be an id that docker can recognize such as a container hash or name. |
| data.cmd | <code>String</code> |  | A String of a command or an Array whose elements are the parts of the command. |
| [data.opts] | <code>Object</code> |  | Options on how to run the command. |
| [data.opts.mode] | <code>String</code> | <code>&#x27;collect&#x27;</code> | Either `collect` or `attach`. Attach will connect to the run `stdin`. |
| [data.opts.pre] | <code>String</code> |  | A String or Array of additional arguments or options to append to the `cmd` before the user specified args and options are added. |
| [data.opts.attachStdin] | <code>Boolean</code> | <code>false</code> | Attach to the run's `stdin`. Helpful if you think there will be interactive options or prompts. |
| [data.opts.attachStdout] | <code>Boolean</code> | <code>true</code> | Attach to the run's `stdout`. Helpful to determine what the command is doing. |
| [data.opts.attachStderr] | <code>Boolean</code> | <code>true</code> | Attach to the run's `stderr`. Helpful to determine any errors. |
| [data.opts.env] | <code>Array</code> | <code>[]</code> | Additional environmental variables to set for the cmd. Must be in the form `KEY=VALUE`. |
| [data.opts.detachKeys] | <code>String</code> | <code>&#x27;ctrl-p,ctrl-q&#x27;</code> | Keystrokes that will detach the process. |
| [data.opts.tty] | <code>Boolean</code> | <code>true</code> | Allocate a pseudo `tty`. |
| [data.opts.user] | <code>String</code> | <code>&#x27;root&#x27;</code> | The user to run the command as. Can also be `user:group` or `uid` or `uid:gid`. |

**Returns**: <code>Promise</code> - A Promise with a string containing the command's output.  
**Example**  
```js
// Run composer install on the appserver container for an app called myapp
return lando.engine.run({id: 'myapp_appserver_1', cmd: ['composer', 'install']});

// Drop into an interactive bash shell on the database continer for an app called myapp
var bashRun = {
  id: 'myapp_database_1',
  cmd: ['bash'],
  opts: {
    mode: 'attach'
  }
};

return lando.engine.run(bashRun);
```
<div class="api-body-footer"></div>
<a id="landoenginestop"></a>

<h2 id="landoenginestop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.stop(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Stops containers for a `compose` object or a particular container.

There are two ways to stop containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_stop</code>](#event_pre_engine_stop), [<code>post_engine_stop</code>](#event_post_engine_stop)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Stop criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> |  | An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on what services to setop |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | An Array of services to stop. |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Stop a specific container by id
return lando.engine.stop({name: 'myapp_service_1'})
.then(function() {
  lando.log.info('Container has stopped.');
});

// Assume we have an `app` object called `app` already.

// Stop all the containers for a particular app.
return lando.engine.stop(app);

// Stop a certain subset of an app's services.
app.opts = {
  services: ['index', 'appserver', 'db', 'db2']
};
return lando.engine.stop(app);
```
<div class="api-body-footer"></div>
<a id="landoenginedestroy"></a>

<h2 id="landoenginedestroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.destroy(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Removes containers for a `compose` object or a particular container.

There are two ways to remove containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_destroy</code>](#event_pre_engine_destroy), [<code>post_engine_destroy</code>](#event_post_engine_destroy)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Remove criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> |  | An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on what services to remove. |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | An Array of services to remove. |
| [data.opts.volumes] | <code>Boolean</code> | <code>true</code> | Also remove volumes associated with the container(s). |
| [data.opts.force] | <code>Boolean</code> | <code>false</code> | Force remove the containers. |
| [data.opts.purge] | <code>Boolean</code> | <code>false</code> | Implies `volumes` and `force`. |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Remove a specific container by id
return lando.engine.destroy({name: 'myapp_service_1'})
.then(function() {
  lando.log.info('Container has been destroyed.');
});

// Assume we have an `app` object called `app` already.

// Destroy all the containers for a particular app.
return lando.engine.destroy(app);

// Force remove a certain subset of an app's services and their volumes
app.opts = {
  services: ['index', 'appserver', 'db', 'db2'],
  v: true,
  force: true
};
return lando.engine.destroy(app);
```
<div class="api-body-footer"></div>
<a id="landoenginelogs"></a>

<h2 id="landoenginelogs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.logs(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Returns logs for a given `compose` object

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A `compose` Object or an Array of `compose` Objects if you want to get logs for more than one set of services. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to build the `compose` objects containers. |
| [data.opts.follow] | <code>Boolean</code> | <code>false</code> | Whether to follow the log. Works like `tail -f`. |
| [data.opts.timestamps] | <code>Boolean</code> | <code>true</code> | Show timestamps in log. |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Get logs for an app
return lando.engine.logs(app);
```
<div class="api-body-footer"></div>
<a id="landoenginebuild"></a>

<h2 id="landoenginebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.build(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Tries to pull the services for a `compose` object, and then tries to build them if they are found
locally. This is a wrapper around `docker pull` and `docker build`.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_build</code>](#event_pre_engine_build), [<code>post_engine_build</code>](#event_post_engine_build)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A `compose` Object or an Array of `compose` Objects if you want to build more than one set of services. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to build the `compose` objects containers. |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | The services to build. |
| [data.opts.nocache] | <code>Boolean</code> | <code>true</code> | Ignore the build cache. |
| [data.opts.pull] | <code>Boolean</code> | <code>true</code> | Try to pull first. |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Build the containers for an `app` object
return lando.engine.build(app);
```
<div class="api-body-footer"></div>
<a id="landoenginegetnetworks"></a>

<h2 id="landoenginegetnetworks" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.getNetworks([opts]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Gets the docker networks.

**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Options to pass into the docker networks call |
| [opts.filters] | <code>Object</code> | Filters options |

**Returns**: <code>Promise</code> - A Promise with an array of network objects.  
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
 return lando.engine.getNetworks(opts)

 // Filter out lando_default
 .filter(function(network) {
   return network.Name !== 'lando_default';
 })

 // Map to list of network names
 .map(function(network) {
   return network.Name;
 });
```
<div class="api-body-footer"></div>
<a id="landoenginegetnetwork"></a>

<h2 id="landoenginegetnetwork" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.getNetwork(id) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Gets a Docker network

**Since**: 3.0.0.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the network |

**Returns**: <code>Object</code> - A Dockerode Network object .  
**Example**  
```js
// Get the network
 return lando.engine.getNetwork('mynetwork')
```
<div class="api-body-footer"></div>
<a id="landoenginecreatenetwork"></a>

<h2 id="landoenginecreatenetwork" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.createNetwork(name, [opts]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Creates a Docker network

**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.35/#operation/NetworkCreate) for info on opts.  
**Since**: 3.0.0.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the networks |
| [opts] | <code>Object</code> | See API network docs above |

**Returns**: <code>Promise</code> - A Promise with inspect data.  
**Example**  
```js
// Create the network
 return ando.engine.createNetwork('mynetwork')
```
<div class="api-body-footer"></div>
<a id="landoinitget"></a>

<h2 id="landoinitget" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.get()</h2>
<div class="api-body-header"></div>

Get an init method

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoinitadd"></a>

<h2 id="landoinitadd" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.add()</h2>
<div class="api-body-header"></div>

Add an init method to the registry

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoinitclonerepo"></a>

<h2 id="landoinitclonerepo" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.cloneRepo()</h2>
<div class="api-body-header"></div>

Helper to return a performant git clone command

This clones to /tmp and then moves to /app to avoid file sharing performance
hits

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoinitcreatekey"></a>

<h2 id="landoinitcreatekey" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.createKey()</h2>
<div class="api-body-header"></div>

Helper to return a create key command

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoinitrun"></a>

<h2 id="landoinitrun" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.run()</h2>
<div class="api-body-header"></div>

Run a command during the init process

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoinitkill"></a>

<h2 id="landoinitkill" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.kill()</h2>
<div class="api-body-header"></div>

Helper to kill any running util processes

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoinitbuild"></a>

<h2 id="landoinitbuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.build()</h2>
<div class="api-body-header"></div>

The core init method

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoinityaml"></a>

<h2 id="landoinityaml" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.init.yaml()</h2>
<div class="api-body-header"></div>

Helper to spit out a .lando.yml file

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landorecipesget"></a>

<h2 id="landorecipesget" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.recipes.get()</h2>
<div class="api-body-header"></div>

Get a recipe

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landorecipesadd"></a>

<h2 id="landorecipesadd" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.recipes.add()</h2>
<div class="api-body-header"></div>

Add a recipe to the registry

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landorecipesbuild"></a>

<h2 id="landorecipesbuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.recipes.build()</h2>
<div class="api-body-header"></div>

The core recipe builder

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landorecipeswebroot"></a>

<h2 id="landorecipeswebroot" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.recipes.webroot()</h2>
<div class="api-body-header"></div>

Helper to let us know whether this app requires a webroot question or not

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landorecipesname"></a>

<h2 id="landorecipesname" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.recipes.name()</h2>
<div class="api-body-header"></div>

Helper to let us know whether this app requires a name question or not

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoservicesadd"></a>

<h2 id="landoservicesadd" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.services.add()</h2>
<div class="api-body-header"></div>

Add a service to the registry

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoservicesinfo"></a>

<h2 id="landoservicesinfo" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.services.info()</h2>
<div class="api-body-header"></div>

Delegator to gather info about a service for display to the user

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoservicesbuild"></a>

<h2 id="landoservicesbuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.services.build()</h2>
<div class="api-body-header"></div>

The core service builder

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoserviceshealthcheck"></a>

<h2 id="landoserviceshealthcheck" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.services.healthcheck()</h2>
<div class="api-body-header"></div>

Does a healthcheck on a service

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landotoolingbuild"></a>

<h2 id="landotoolingbuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.tooling.build()</h2>
<div class="api-body-header"></div>

The tooling command builder

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_instantiate_app"></a>

<h2 id="event_pre_instantiate_app" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_instantiate_app"</h2>
<div class="api-body-header"></div>

Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<div class="api-body-footer"></div>
<a id="event_post_instantiate_app"></a>

<h2 id="event_post_instantiate_app" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_instantiate_app"</h2>
<div class="api-body-header"></div>

Event that allows altering of the app object right after it is
instantiated.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The user's app config. |

**Example**  
```js
// Add some extra app properties to all apps
lando.events.on('post-instantiate-app', 1, function(app) {

  // Add in some global container envvars
  app.env.LANDO = 'ON';
  app.env.LANDO_HOST_OS = lando.config.os.platform;
  app.env.LANDO_HOST_UID = lando.config.engineId;
  app.env.LANDO_HOST_GID = lando.config.engineGid;

});
```
<div class="api-body-footer"></div>
<a id="event_app_ready"></a>

<h2 id="event_app_ready" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "app_ready"</h2>
<div class="api-body-header"></div>

Event that allows altering of the app object right after it has been
full instantiated and all its plugins have been loaded.

The difference between this event and `post-instantiate-app` is that at
this point the event has been handed off from the global `lando.events.on`
context to the `app.events.on` context. This means that `post-instantiate-app` will
run for ALL apps that need to be instantiated while `app-ready` will run
on an app to app basis.

**Since**: 3.0.0  
**Example**  
```js
// Add logging to report on our apps properties after its full dialed
app.events.on('app-ready', function() {

  // Log
  lando.log.verbose('App %s has global env.', app.name, app.env);
  lando.log.verbose('App %s has global labels.', app.name, app.labels);
  lando.log.verbose('App %s adds process env.', app.name, app.processEnv);

});
```
<div class="api-body-footer"></div>
<a id="event_pre_info"></a>

<h2 id="event_pre_info" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_info"</h2>
<div class="api-body-header"></div>

Event that allows other things to add useful metadata to the apps services.

Its helpful to use this event to add in information for the end user such as
how to access their services, where their code exsts or relevant credential info.

**Since**: 3.0.0  
**Example**  
```js
// Add urls to the app
app.events.on('pre-info', function() {
  return getUrls(app);
});
```
<div class="api-body-footer"></div>
<a id="event_post_info"></a>

<h2 id="event_post_info" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_info"</h2>
<div class="api-body-header"></div>

Event that allows other things to add useful metadata to the apps services.

Its helpful to use this event to add in information for the end user such as
how to access their services, where their code exsts or relevant credential info.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_uninstall"></a>

<h2 id="event_pre_uninstall" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_uninstall"</h2>
<div class="api-body-header"></div>

Event that runs before an app is uninstalled.

This is useful if you want to add or remove parts of the uninstall process.
For example, it might be nice to persist a container whose data you do not
want to replace in a rebuild and that cannot persist easily with a volume.

**Since**: 3.0.0  
**Example**  
```js
// Do not uninstall the solr service
app.events.on('pre-uninstall', function() {
  delete app.services.solr;
});
```
<div class="api-body-footer"></div>
<a id="event_post_uninstall"></a>

<h2 id="event_post_uninstall" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_uninstall"</h2>
<div class="api-body-header"></div>

Event that runs after an app is uninstalled.

This is useful if you want to do some additional cleanup steps after an
app is uninstalled such as invalidating any cached data.

**Since**: 3.0.0  
**Example**  
```js
// Make sure we remove our build cache
app.events.on('post-uninstall', function() {
  lando.cache.remove(app.name + '.last_build');
});
```
<div class="api-body-footer"></div>
<a id="event_pre_start"></a>

<h2 id="event_pre_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_start"</h2>
<div class="api-body-header"></div>

Event that runs before an app starts up.

This is useful if you want to start up any support services before an app
stars.

**Since**: 3.0.0  
**Example**  
```js
// Start up a DNS server before our app starts
app.events.on('pre-start', function() {
  return lando.engine.start(dnsServer);
});
```
<div class="api-body-footer"></div>
<a id="event_post_start"></a>

<h2 id="event_post_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_start"</h2>
<div class="api-body-header"></div>

Event that runs after an app is started.

This is useful if you want to perform additional operations after an app
starts such as running additional build commands.

**Since**: 3.0.0  
**Example**  
```js
// Go through each service and run additional build commands as needed
app.events.on('post-start', function() {

  // Start up a build collector
  var build = [];

  // Go through each service
  _.forEach(app.config.services, function(service, name) {

    // If the service has run steps let's loop through and run some commands
    if (!_.isEmpty(service.run)) {

      // Normalize data for loopage
      if (!_.isArray(service.run)) {
        service.run = [service.run];
      }

      // Run each command
      _.forEach(service.run, function(cmd) {

        // Build out the compose object
        var compose = {
          id: [service, name, '1'].join('_'),
            cmd: cmd,
            opts: {
            mode: 'attach'
          }
        };

        // Push to the build
        build.push(compose);

      });

    }

  });

  // Only proceed if build is non-empty
  if (!_.isEmpty(build)) {

   // Get the last build cache key
   var key = app.name + ':last_build';

   // Compute the build hash
   var newHash = lando.node.hasher(app.config.services);

   // If our new hash is different then lets build
   if (lando.cache.get(key) !== newHash) {

     // Set the new hash
     lando.cache.set(key, newHash, {persist:true});

     // Run all our post build steps serially
     return lando.engine.run(build);

   }
  }
});
```
<div class="api-body-footer"></div>
<a id="event_pre_stop"></a>

<h2 id="event_pre_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_stop"</h2>
<div class="api-body-header"></div>

Event that runs before an app stops.

**Since**: 3.0.0  
**Example**  
```js
// Stop a DNS server before our app stops.
app.events.on('pre-stop', function() {
  return lando.engine.stop(dnsServer);
});
```
<div class="api-body-footer"></div>
<a id="event_post_stop"></a>

<h2 id="event_post_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_stop"</h2>
<div class="api-body-header"></div>

Event that runs after an app stop.

**Since**: 3.0.0  
**Example**  
```js
// Stop a DNS server after our app stops.
app.events.on('post-stop', function() {
  return lando.engine.stop(dnsServer);
});
```
<div class="api-body-footer"></div>
<a id="event_pre_destroy"></a>

<h2 id="event_pre_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_destroy"</h2>
<div class="api-body-header"></div>

Event that runs before an app is destroyed.

**Since**: 3.0.0  
**Example**  
```js
// Make sure the proxy is down before we destroy
app.events.on('pre-destroy', function() {
  if (fs.existsSync(proxyFile)) {
    return lando.engine.stop(getProxy(proxyFile));
  }
});
```
<div class="api-body-footer"></div>
<a id="event_post_destroy"></a>

<h2 id="event_post_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_destroy"</h2>
<div class="api-body-header"></div>

Event that runs after an app is destroyed.

**Since**: 3.0.0  
**Example**  
```js
// Make sure the proxy is up brought back up after we destroy
app.events.on('post-destroy', function() {
  return startProxy();
});
```
<div class="api-body-footer"></div>
<a id="event_pre_rebuild"></a>

<h2 id="event_pre_rebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_rebuild"</h2>
<div class="api-body-header"></div>

Event that runs before an app is rebuilt.

**Since**: 3.0.0  
**Example**  
```js
// Do something
app.events.on('post-rebuild', function() {
  // Do something
});
```
<div class="api-body-footer"></div>
<a id="event_post_rebuild"></a>

<h2 id="event_post_rebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_rebuild"</h2>
<div class="api-body-header"></div>

Event that runs after an app is rebuilt.

**Since**: 3.0.0  
**Example**  
```js
// Do something
app.events.on('post-rebuild', function() {
  // Do something
});
```
<div class="api-body-footer"></div>
<a id="event_pre_engine_up"></a>

<h2 id="event_pre_engine_up" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_up"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before the docker engine is booted
up.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_up"></a>

<h2 id="event_post_engine_up" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_up"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after the docker engine is booted
up.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_down"></a>

<h2 id="event_pre_engine_down" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_down"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after the docker engine is booted
up.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_down"></a>

<h2 id="event_post_engine_down" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_down"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after the docker engine is booted
up.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_start"></a>

<h2 id="event_pre_engine_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_start"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_start"></a>

<h2 id="event_post_engine_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_start"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_run"></a>

<h2 id="event_pre_engine_run" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_run"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a command is run on a particular
container.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_run"></a>

<h2 id="event_post_engine_run" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_run"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after a command is run on a particular
container.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_stop"></a>

<h2 id="event_pre_engine_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_stop"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before some containers are stopped.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_stop"></a>

<h2 id="event_post_engine_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_stop"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after some containers are stopped.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_destroy"></a>

<h2 id="event_pre_engine_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_destroy"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before some containers are destroyed.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_destroy"></a>

<h2 id="event_post_engine_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_destroy"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after some containers are destroyed.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_build"></a>

<h2 id="event_pre_engine_build" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_build"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_build"></a>

<h2 id="event_post_engine_build" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_build"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
