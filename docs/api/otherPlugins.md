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

  // Add in some global container envconsts
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
  const build = [];

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
        const compose = {
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
   const key = app.name + ':last_build';

   // Compute the build hash
   const newHash = lando.node.hasher(app.config.services);

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
const app = {
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
const app = {
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
<a id="landoservicesadd"></a>

<h2 id="landoservicesadd" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.services.add(name, service)</h2>
<div class="api-body-header"></div>

Add a service to the registry

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the service |
| service | <code>Module</code> | The required module |

<div class="api-body-footer"></div>
