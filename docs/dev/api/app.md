<a name="module_app"></a>

## app
Contains methods and events related to app actions.

**Since**: 3.0.0  
**Example**  
```js
// Start an app
return lando.app.start(app);

// Stop an app
return lando.app.stop(app);

// Destroy an app
return lando.app.destroy(app);

// Get the app called myapp
return lando.app.get('myapp')
.then(function(app) {
  console.log(app);
});

// Get a list of all the apps
return lando.app.list()
.then(function(apps) {
  console.log(apps);
});
```

* [app](#module_app)
    * _static_
        * ["event:pre-instantiate-app"](#module_app.event_pre-instantiate-app)
        * ["event:post-instantiate-app"](#module_app.event_post-instantiate-app)
        * ["event:app-ready"](#module_app.event_app-ready)
        * ["event:pre-info"](#module_app.event_pre-info)
        * ["event:post-info"](#module_app.event_post-info)
        * ["event:pre-uninstall"](#module_app.event_pre-uninstall)
        * ["event:post-uninstall"](#module_app.event_post-uninstall)
        * ["event:pre-start"](#module_app.event_pre-start)
        * ["event:post-start"](#module_app.event_post-start)
        * ["event:pre-stop"](#module_app.event_pre-stop)
        * ["event:post-stop"](#module_app.event_post-stop)
        * ["event:pre-destroy"](#module_app.event_pre-destroy)
        * ["event:post-destroy"](#module_app.event_post-destroy)
        * ["event:pre-rebuild"](#module_app.event_pre-rebuild)
        * ["event:post-rebuild"](#module_app.event_post-rebuild)
    * _inner_
        * [~metricsParse()](#module_app..metricsParse)
        * [~register(app)](#module_app..register) ⇒ <code>Promise</code>
        * [~unregister(app)](#module_app..unregister) ⇒ <code>Promise</code>
        * [~list()](#module_app..list) ⇒ <code>Promise</code>
        * [~get([appName])](#module_app..get) ⇒ <code>Promise</code>
        * [~isRunning(app, checkall)](#module_app..isRunning) ⇒ <code>Promise</code>
        * [~exists(appName)](#module_app..exists) ⇒ <code>Promise</code>
        * [~info(app)](#module_app..info) ⇒ <code>Promise</code>
        * [~uninstall(app)](#module_app..uninstall) ⇒ <code>Promise</code>
        * [~cleanup(app)](#module_app..cleanup) ⇒ <code>Promise</code>
        * [~start(app)](#module_app..start) ⇒ <code>Promise</code>
        * [~stop(app)](#module_app..stop) ⇒ <code>Promise</code>
        * [~restart(app)](#module_app..restart) ⇒ <code>Promise</code>
        * [~destroy(app)](#module_app..destroy) ⇒ <code>Promise</code>
        * [~rebuild(app)](#module_app..rebuild) ⇒ <code>Promise</code>

<a name="module_app.event_pre-instantiate-app"></a>

### "event:pre-instantiate-app"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>app</code>](#module_app)  
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
<a name="module_app.event_post-instantiate-app"></a>

### "event:post-instantiate-app"
Event that allows altering of the app object right after it is
instantiated.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>app</code>](#module_app)  
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
<a name="module_app.event_app-ready"></a>

### "event:app-ready"
Event that allows altering of the app object right after it has been
full instantiated and all its plugins have been loaded.

The difference between this event and `post-instantiate-app` is that at
this point the event has been handed off from the global `lando.events.on`
context to the `app.events.on` context. This means that `post-instantiate-app` will
run for ALL apps that need to be instantiated while `app-ready` will run
on an app to app basis.

**Kind**: event emitted by [<code>app</code>](#module_app)  
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
<a name="module_app.event_pre-info"></a>

### "event:pre-info"
Event that allows other things to add useful metadata to the apps services.

Its helpful to use this event to add in information for the end user such as
how to access their services, where their code exsts or relevant credential info.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Add urls to the app
app.events.on('pre-info', function() {
  return getUrls(app);
});
```
<a name="module_app.event_post-info"></a>

### "event:post-info"
Event that allows other things to add useful metadata to the apps services.

Its helpful to use this event to add in information for the end user such as
how to access their services, where their code exsts or relevant credential info.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
<a name="module_app.event_pre-uninstall"></a>

### "event:pre-uninstall"
Event that runs before an app is uninstalled.

This is useful if you want to add or remove parts of the uninstall process.
For example, it might be nice to persist a container whose data you do not
want to replace in a rebuild and that cannot persist easily with a volume.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Do not uninstall the solr service
app.events.on('pre-uninstall', function() {
  delete app.services.solr;
});
```
<a name="module_app.event_post-uninstall"></a>

### "event:post-uninstall"
Event that runs after an app is uninstalled.

This is useful if you want to do some additional cleanup steps after an
app is uninstalled such as invalidating any cached data.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Make sure we remove our build cache
app.events.on('post-uninstall', function() {
  lando.cache.remove(app.name + ':last_build');
});
```
<a name="module_app.event_pre-start"></a>

### "event:pre-start"
Event that runs before an app starts up.

This is useful if you want to start up any support services before an app
stars.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Start up a DNS server before our app starts
app.events.on('pre-start', function() {
  return lando.engine.start(dnsServer);
});
```
<a name="module_app.event_post-start"></a>

### "event:post-start"
Event that runs after an app is started.

This is useful if you want to perform additional operations after an app
starts such as running additional build commands.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Go through each service and run additional build commands as needed
app.events.on('post-start', function() {

  // Start up a build collector
  var build = [];

  // Go through each service
  _.forEach(app.config.services, function(service, name) {

    // If the service has extras let's loop through and run some commands
    if (!_.isEmpty(service.extras)) {

      // Normalize data for loopage
      if (!_.isArray(service.extras)) {
        service.extras = [service.extras];
      }

      // Run each command
      _.forEach(service.extras, function(cmd) {

        // Build out the compose object
        var compose = {
          id: [app.dockerName, name, '1'].join('_'),
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
<a name="module_app.event_pre-stop"></a>

### "event:pre-stop"
Event that runs before an app stops.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Stop a DNS server before our app stops.
app.events.on('pre-stop', function() {
  return lando.engine.stop(dnsServer);
});
```
<a name="module_app.event_post-stop"></a>

### "event:post-stop"
Event that runs after an app stop.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Stop a DNS server after our app stops.
app.events.on('post-stop', function() {
  return lando.engine.stop(dnsServer);
});
```
<a name="module_app.event_pre-destroy"></a>

### "event:pre-destroy"
Event that runs before an app is destroyed.

**Kind**: event emitted by [<code>app</code>](#module_app)  
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
<a name="module_app.event_post-destroy"></a>

### "event:post-destroy"
Event that runs after an app is destroyed.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Make sure the proxy is up brought back up after we destroy
app.events.on('post-destroy', function() {
  return startProxy();
});
```
<a name="module_app.event_pre-rebuild"></a>

### "event:pre-rebuild"
Event that runs before an app is rebuilt.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Do something
app.events.on('post-rebuild', function() {
  // Do something
});
```
<a name="module_app.event_post-rebuild"></a>

### "event:post-rebuild"
Event that runs after an app is rebuilt.

**Kind**: event emitted by [<code>app</code>](#module_app)  
**Since**: 3.0.0  
**Example**  
```js
// Do something
app.events.on('post-rebuild', function() {
  // Do something
});
```
<a name="module_app..metricsParse"></a>

### app~metricsParse()
Helper to parse metrics data

**Kind**: inner method of [<code>app</code>](#module_app)  
<a name="module_app..register"></a>

### app~register(app) ⇒ <code>Promise</code>
Adds an app to the app registry.

**Kind**: inner method of [<code>app</code>](#module_app)  
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
<a name="module_app..unregister"></a>

### app~unregister(app) ⇒ <code>Promise</code>
Removes an app from the app registry.

**Kind**: inner method of [<code>app</code>](#module_app)  
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
return lando.unregister(app);
```
<a name="module_app..list"></a>

### app~list() ⇒ <code>Promise</code>
Lists all the Lando apps from the app registry.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - Returns a Promise with an array of apps from the registry  
**Since**: 3.0.0  
**Example**  
```js
// List all the apps
return lando.app.list()

// Pretty print each app to the console.
.map(function(app) {
  console.log(JSON.stringify(app, null, 2));
});
```
<a name="module_app..get"></a>

### app~get([appName]) ⇒ <code>Promise</code>
Gets a fully instantiated app object.

If you do not pass in an `appName` Lando will attempt to find an app in your
current working directory.

Lando will also scan parent directories if no app is found.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - Returns a Pronise with an instantiated app object or nothing.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [appName] | <code>String</code> | The name of the app to get. |

**Example**  
```js
// Get an app named myapp and start it
return lando.app.get('myapp')

// Start the app
.then(function(app) {
  lando.app.start(app);
});
```
<a name="module_app..isRunning"></a>

### app~isRunning(app, checkall) ⇒ <code>Promise</code>
Determines whether an app is running or not. By defualt it only requires
that a single service for that be running to return true but see opts below.

You can pass in an entire app object here but it really just needs an object
with the app name eg {name: 'myapp'}

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - Returns a Promise with a boolean of whether the app is running or not.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | An app object. |
| app.name | <code>String</code> | The name of the app |
| checkall | <code>Boolean</code> | Make sure ALL the apps containers are running |

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
<a name="module_app..exists"></a>

### app~exists(appName) ⇒ <code>Promise</code>
Checks to see if the app exists or not.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A promise with a boolean of whether the app exists or not.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>String</code> | The name of the app to get. |

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
<a name="module_app..info"></a>

### app~info(app) ⇒ <code>Promise</code>
Prints useful information about the app's services.

This should return information about the services the app is running,
URLs the app can be accessed at, relevant connection information like database
credentials and any other information that is added by other plugins.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise with an object of information about the app keyed by its services  
**Emits**: <code>event:pre-info</code>, <code>event:post-info</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

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
<a name="module_app..uninstall"></a>

### app~uninstall(app) ⇒ <code>Promise</code>
Soft removes the apps services but maintains persistent data like app volumes.

This differs from `destroy` in that destroy will hard remove all app services,
volumes, networks, etc as well as remove the app from the appRegistry.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-uninstall</code>, <code>event:post-uninstall</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Example**  
```js
// Uninstall the app
return lando.app.uninstall(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<a name="module_app..cleanup"></a>

### app~cleanup(app) ⇒ <code>Promise</code>
Does some helpful cleanup before running an app operation.

This command helps clean up apps in an inconsistent state and any orphaned
containers they may have.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise.  
**Since**: 3.0.0  
**Todo**

- [ ] Should this be an internal method? Or can we deprecate at some point?


| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Example**  
```js
// Do the app cleanup
return lando.app.cleanup(app)
```
<a name="module_app..start"></a>

### app~start(app) ⇒ <code>Promise</code>
Starts an app.

This will start up all services/containers that have been defined for this app.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-start</code>, <code>event:post-start</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Example**  
```js
// Start the app
return lando.app.start(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<a name="module_app..stop"></a>

### app~stop(app) ⇒ <code>Promise</code>
Stops an app.

This will stop all services/containers that have been defined for this app.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-stop</code>, <code>event:post-stop</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Example**  
```js
// Stop the app
return lando.app.stop(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<a name="module_app..restart"></a>

### app~restart(app) ⇒ <code>Promise</code>
Stops and then starts an app.

This just runs `app.stop` and `app.start` in succession.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-stop</code>, <code>event:stop-stop</code>, <code>event:pre-start</code>, <code>event:post-start</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Example**  
```js
// Restart the app
return lando.app.restart(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<a name="module_app..destroy"></a>

### app~destroy(app) ⇒ <code>Promise</code>
Hard removes all app services, olumes, networks, etc as well as removes the
app from the appRegistry.

This differs from `uninstall` in that uninstall will only soft remove all app
services, while maintaining things like volumes, networks, etc as well as an
entry in the appRegistry.

That said this DOES call both `stop` and `uninstall`.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-destroy</code>, <code>event:pre-stop</code>, <code>event:post-stop</code>, <code>event:pre-uninstall</code>, <code>event:post-uninstall</code>, <code>event:post-destroy</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Example**  
```js
// Destroy the app
return lando.app.destroy(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
<a name="module_app..rebuild"></a>

### app~rebuild(app) ⇒ <code>Promise</code>
Rebuilds an app.

This will stop an app, soft remove its services, rebuild those services and
then, finally, start the app back up again. This is useful for developers who
might want to tweak Dockerfiles or compose yamls.

**Kind**: inner method of [<code>app</code>](#module_app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-stop</code>, <code>event:post-stop</code>, <code>event:pre-uninstall</code>, <code>event:post-uninstall</code>, <code>event:pre-start</code>, <code>event:post-start</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Example**  
```js
// Destroy the app
return lando.app.destroy(app)

// Catch any errors
catch(function(err) {
  lando.log.error(err);
});
```
