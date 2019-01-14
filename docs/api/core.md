<a id="event_pre_destroy"></a>

<h2 id="event_pre_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_destroy"</h2>
<div class="api-body-header"></div>

Event that runs before an app is destroyed.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_destroy"></a>

<h2 id="event_post_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_destroy"</h2>
<div class="api-body-header"></div>

Event that runs after an app is destroyed.

**Since**: 3.0.0  
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
<div class="api-body-footer"></div>
<a id="event_pre_rebuild"></a>

<h2 id="event_pre_rebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_rebuild"</h2>
<div class="api-body-header"></div>

Event that runs before an app is rebuilt.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_rebuild"></a>

<h2 id="event_post_rebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_rebuild"</h2>
<div class="api-body-header"></div>

Event that runs after an app is rebuilt.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_start"></a>

<h2 id="event_pre_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_start"</h2>
<div class="api-body-header"></div>

Event that runs before an app starts up.

This is useful if you want to start up any support services before an app
stars.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_start"></a>

<h2 id="event_post_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_start"</h2>
<div class="api-body-header"></div>

Event that runs after an app is started.

This is useful if you want to perform additional operations after an app
starts such as running additional build commands.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_stop"></a>

<h2 id="event_pre_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_stop"</h2>
<div class="api-body-header"></div>

Event that runs before an app stops.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_stop"></a>

<h2 id="event_post_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_stop"</h2>
<div class="api-body-header"></div>

Event that runs after an app stop.

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
<div class="api-body-footer"></div>
<a id="event_post_uninstall"></a>

<h2 id="event_post_uninstall" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_uninstall"</h2>
<div class="api-body-header"></div>

Event that runs after an app is uninstalled.

This is useful if you want to do some additional cleanup steps after an
app is uninstalled such as invalidating any cached data.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_build"></a>

<h2 id="event_pre_engine_build" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_build"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` object's containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_build"></a>

<h2 id="event_post_engine_build" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_build"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` object's containers are
started

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
<a id="event_pre_bootstrap"></a>

<h2 id="event_pre_bootstrap" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_bootstrap"</h2>
<div class="api-body-header"></div>

Event that allows other things to augment the lando global config.

This is useful so plugins can add additional config settings to the global
config.

NOTE: This might only be available in core plugins

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The global Lando config |

**Example**  
```js
// Add engine settings to the config
lando.events.on('pre-bootstrap-LEVEL', config => {
  const engineConfig = daemon.getEngineConfig();
  config.engineHost = engineConfig.host;
});
```
<div class="api-body-footer"></div>
<a id="event_post_bootstrap"></a>

<h2 id="event_post_bootstrap" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_bootstrap"</h2>
<div class="api-body-header"></div>

Event that allows other things to augment the lando object.

This is useful so plugins can add additional modules to lando before
the bootstrap is completed.

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | <code>Object</code> | The Lando object |

**Example**  
```js
// Add the services module to lando
lando.events.on('post-bootstrap', lando => {
  lando.services = require('./services')(lando);
});
```
<div class="api-body-footer"></div>
<a id="landopromiseretry"></a>

<h2 id="landopromiseretry" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.Promise.retry(fn, [opts]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Adds a retry method to all Promise instances.

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | The function to retry. |
| [opts] | <code>Opts</code> |  | Options to specify how retry works. |
| [opts.max] | <code>Integer</code> | <code>5</code> | The amount of times to retry. |
| [opts.backoff] | <code>Integer</code> | <code>500</code> | The amount to wait between retries. In miliseconds and cumulative. |

**Returns**: <code>Promise</code> - A Promise  
**Example**  
```js
// And then retry 25 times until we've connected, increase delay between retries by 1 second
Promise.retry(someFunction, {max: 25, backoff: 1000});
```
<div class="api-body-footer"></div>
<a id="landopromise"></a>

<h2 id="landopromise" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.Promise()</h2>
<div class="api-body-header"></div>

Extends [bluebird](http://bluebirdjs.com/docs/api-reference.html)
so that our promises have some retry functionality.

All functionality should be the same as bluebird except where indicated
below

Note that bluebird currently wants you to use scoped prototypes to extend
it rather than the normal extend syntax so that is why this is using the "old"
way

**See**

- http://bluebirdjs.com/docs/api-reference.html
- https://github.com/petkaantonov/bluebird/issues/1397

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

**Emits**: [<code>pre\_destroy</code>](#event_pre_destroy), [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall), [<code>post\_destroy</code>](#event_post_destroy)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="landoapprebuild"></a>

<h2 id="landoapprebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.rebuild(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Rebuilds an app.

This will stop an app, soft remove its services, rebuild those services and
then, finally, start the app back up again. This is useful for developers who
might want to tweak Dockerfiles or compose yamls.

**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall), [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="landoapprestart"></a>

<h2 id="landoapprestart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.restart(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Stops and then starts an app.

This just runs `app.stop` and `app.start` in succession.

**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="landoappstart"></a>

<h2 id="landoappstart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.start(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Starts an app.

This will start up all services/containers that have been defined for this app.

**Emits**: [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="landoappstop"></a>

<h2 id="landoappstop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.stop(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Stops an app.

This will stop all services/containers that have been defined for this app.

**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="landoappuninstall"></a>

<h2 id="landoappuninstall" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.uninstall(purge) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Soft removes the apps services but maintains persistent data like app volumes.

This differs from `destroy` in that destroy will hard remove all app services,
volumes, networks, etc as well as remove the app from the appRegistry.

**Emits**: [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| purge | <code>Boolean</code> | <code>false</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="landocacheset"></a>

<h2 id="landocacheset" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.set(key, data, [opts])</h2>
<div class="api-body-header"></div>

Sets an item in the cache

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>String</code> |  | The name of the key to store the data with. |
| data | <code>Any</code> |  | The data to store in the cache. |
| [opts] | <code>Object</code> |  | Options to pass into the cache |
| [opts.persist] | <code>Boolean</code> | <code>false</code> | Whether this cache data should persist between processes. Eg in a file instead of memory |
| [opts.ttl] | <code>Integer</code> | <code>0</code> | Seconds the cache should live. 0 mean forever. |

**Example**  
```js
// Add a string to the cache
lando.cache.set('mykey', 'mystring');

// Add an object to persist in the file cache
lando.cache.set('mykey', data, {persist: true});

// Add an object to the cache for five seconds
lando.cache.set('mykey', data, {ttl: 5});
```
<div class="api-body-footer"></div>
<a id="landocacheget"></a>

<h2 id="landocacheget" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.get(key) ⇒ <code>Any</code></h2>
<div class="api-body-header"></div>

Gets an item in the cache

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to retrieve the data. |

**Returns**: <code>Any</code> - The data stored in the cache if applicable.  
**Example**  
```js
// Get the data stored with key mykey
const data = lando.cache.get('mykey');
```
<div class="api-body-footer"></div>
<a id="landocacheremove"></a>

<h2 id="landocacheremove" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.remove(key)</h2>
<div class="api-body-header"></div>

Manually remove an item from the cache.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The name of the key to remove the data. |

**Example**  
```js
// Remove the data stored with key mykey
lando.cache.remove('mykey');
```
<div class="api-body-footer"></div>
<a id="landoenginebuild"></a>

<h2 id="landoenginebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.build(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Tries to pull the services for a `compose` object, and then tries to build them if they are found
locally. This is a wrapper around `docker pull` and `docker build`.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre\_engine\_build</code>](#event_pre_engine_build), [<code>post\_engine\_build</code>](#event_post_engine_build)  
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
<a id="landoenginecreatenetwork"></a>

<h2 id="landoenginecreatenetwork" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.createNetwork(name) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Creates a Docker network

**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.35/#operation/NetworkCreate) for info on opts.  
**Since**: 3.0.0.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the networks |

**Returns**: <code>Promise</code> - A Promise with inspect data.  
**Example**  
```js
// Create the network
return ando.engine.createNetwork('mynetwork')
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

**Emits**: [<code>pre\_engine\_destroy</code>](#event_pre_engine_destroy), [<code>post\_engine\_destroy</code>](#event_post_engine_destroy)  
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
<a id="landoenginerun"></a>

<h2 id="landoenginerun" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.run(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Runs a command on a given service/container. This is a wrapper around `docker exec`.

UNTIL the resolution of https://github.com/apocas/docker-modem/issues/83 data needs to also be or be an
array of compose objects for this to work correctly on Windows as well. See some of the other engine
documentation for what a compose object looks like.

**Emits**: [<code>pre\_engine\_run</code>](#event_pre_engine_run), [<code>post\_engine\_run</code>](#event_post_engine_run)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A run Object or an Array of run Objects if you want to run more tha one command. |
| data.id | <code>String</code> |  | The container to run the command on. Must be an id that docker can recognize such as a container hash or name. |
| data.cmd | <code>String</code> |  | A String of a command or an Array whose elements are the parts of the command. |
| [data.opts] | <code>Object</code> |  | Options on how to run the command. |
| [data.opts.mode] | <code>String</code> | <code>&#x27;collect&#x27;</code> | Either `collect` or `attach`. Attach will connect to the run `stdin`. |
| [data.opts.pre] | <code>String</code> |  | A String or Array of additional arguments or options to append to the `cmd` before the user specified args and options are added. |
| [data.opts.env] | <code>Array</code> | <code>[]</code> | Additional environmental variables to set for the cmd. Must be in the form `KEY=VALUE`. |
| [data.opts.user] | <code>String</code> | <code>&#x27;root&#x27;</code> | The user to run the command as. Can also be `user:group` or `uid` or `uid:gid`. |
| [data.opts.detach] | <code>String</code> | <code>false</code> | Run the process in the background |
| [data.opts.autoRemove] | <code>String</code> | <code>false</code> | Automatically removes the container |

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

**Emits**: [<code>pre\_engine\_start</code>](#event_pre_engine_start), [<code>post\_engine\_start</code>](#event_post_engine_start)  
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

**Emits**: [<code>pre\_engine\_stop</code>](#event_pre_engine_stop), [<code>post\_engine\_stop</code>](#event_post_engine_stop)  
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
<a id="landoerrorhandle"></a>

<h2 id="landoerrorhandle" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.error.handle() ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Returns the lando options

This means all the options passed in before the `--` flag.

**Since**: 3.0.0  
**Todo**

- [ ] make this static and then fix all call sites

**Returns**: <code>Object</code> - Yarg parsed options  
**Example**  
```js
// Gets all the pre-global options that have been specified.
const argv = lando.tasks.argv();
```
<div class="api-body-footer"></div>
<a id="landoeventson"></a>

<h2 id="landoeventson" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events.on(name, [priority], fn) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Our overriden event on method.

This optionally allows a priority to be specified. Lower priorities run first.

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | The name of the event |
| [priority] | <code>Integer</code> | <code>5</code> | The priority the event should run in. |
| fn | <code>function</code> |  | The function to call. Should get the args specified in the corresponding `emit` declaration. |

**Returns**: <code>Promise</code> - A Promise  
**Example**  
```js
// Print out all our apps as they get instantiated and do it before other `post-instantiate-app` events
lando.events.on('post-instantiate-app', 1, app => {
  console.log(app);
});

// Log a helpful message after an app is started, don't worry about whether it runs before or
// after other `post-start` events
return app.events.on('post-start', () => {
  lando.log.info('App %s started', app.name);
});
```
<div class="api-body-footer"></div>
<a id="landoeventsemit"></a>

<h2 id="landoeventsemit" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events.emit(name, [...args]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Reimplements event emit method.

This makes events blocking and promisified.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the event |
| [...args] | <code>Any</code> | Options args to pass. |

**Returns**: <code>Promise</code> - A Promise  
**Example**  
```js
// Emits a global event with a config arg
return lando.events.emit('wolf359', config);

// Emits an app event with a config arg
return app.events.emit('sector001', config);
```
<div class="api-body-footer"></div>
<a id="landoappget"></a>

<h2 id="landoappget" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.app.get([startFrom], [warn]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Gets a fully instantiated app object.

If you do not pass in an `appName` Lando will attempt to find an app in your
current working directory.

Lando will also scan parent directories if no app is found.

**Emits**: <code>event:pre\_instantiate\_app</code>, [<code>post\_instantiate\_app</code>](#event_post_instantiate_app), [<code>app\_ready</code>](#event_app_ready)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [startFrom] | <code>String</code> |  | The name of the app to get. |
| [warn] | <code>Boolean</code> | <code>true</code> | The name of the app to get. |

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
<a id="landologdebug"></a>

<h2 id="landologdebug" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.debug(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a debug message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a debug message
lando.log.debug('All details about docker inspect %j', massiveObject);
```
<div class="api-body-footer"></div>
<a id="landologerror"></a>

<h2 id="landologerror" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.error(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs an error message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log an error message
lando.log.error('This is an err with details %s', err);
```
<div class="api-body-footer"></div>
<a id="landologinfo"></a>

<h2 id="landologinfo" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.info(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs an info message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log an info message
lando.log.info('It is happening!');
```
<div class="api-body-footer"></div>
<a id="landologsilly"></a>

<h2 id="landologsilly" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.silly(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a silly message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a silly message
lando.log.silly('All details about all the things', unreasonablySizedObject);

// Log a silly message
lando.log.silly('If you are seeing this you have delved too greedily and too deep and likely have awoken something.');
```
<div class="api-body-footer"></div>
<a id="landologverbose"></a>

<h2 id="landologverbose" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.verbose(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a verbose message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a verbose message
lando.log.verbose('Config file %j loaded from %d', config, directory);
```
<div class="api-body-footer"></div>
<a id="landologwarn"></a>

<h2 id="landologwarn" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.warn(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a warning message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a warning message
lando.log.warning('Something is up with app %s in directory %s', appName, dir);
```
<div class="api-body-footer"></div>
<a id="landopluginsload"></a>

<h2 id="landopluginsload" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.plugins.load(plugin, [file]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Loads a plugin.

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| plugin | <code>Object</code> |  | A plugin object with name and path |
| [file] | <code>String</code> | <code>plugin.path</code> | An object to inject into the plugin. |
| [...injected] | <code>Object</code> |  | Things to inject into the plugin |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Load the plugin called 'shield-generator' and scan `/tmp` for the plugin
return lando.plugins.load('shield-generator', ['/tmp']);
```
<div class="api-body-footer"></div>
<a id="landoscanurls"></a>

<h2 id="landoscanurls" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.scanUrls(urls, [opts]) ⇒ <code>Array</code></h2>
<div class="api-body-header"></div>

Scans URLs to determine if they are up or down.

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| urls | <code>Array</code> |  | An array of urls like `https://mysite.lndo.site` or `https://localhost:34223` |
| [opts] | <code>Object</code> |  | Options to configure the scan. |
| [opts.max] | <code>Integer</code> | <code>7</code> | The amount of times to retry accessing each URL. |
| [opts.waitCode] | <code>Array</code> | <code>[400, 502, 404]</code> | The HTTP codes to prompt a retry. |

**Returns**: <code>Array</code> - An array of objects of the form {url: url, status: true|false}  
**Example**  
```js
// Scan URLs and print results
return lando.utils.scanUrls(['http://localhost', 'https://localhost'])
.then(function(results) {
  console.log(results);
});
```
<div class="api-body-footer"></div>
<a id="landoshellsh"></a>

<h2 id="landoshellsh" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.shell.sh(cmd, [opts]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Runs a command.

This is an abstraction method that:

 1. Delegates to either node's native `spawn` or `exec` methods.
 2. Promisifies the calling of these function
 3. Handles `stdout`, `stdin` and `stderr`

**See**

- [extra exec options](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
- [extra spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cmd | <code>Array</code> |  | The command to run as elements in an array. |
| [opts] | <code>Object</code> |  | Options to help determine how the exec is run. |
| [opts.mode] | <code>Boolean</code> | <code>&#x27;exec&#x27;</code> | The mode to run in |
| [opts.detached] | <code>Boolean</code> | <code>false</code> | Whether we are running in detached mode or not (deprecated) |
| [opts.cwd] | <code>Boolean</code> | <code>process.cwd()</code> | The directory to run the command from |

**Returns**: <code>Promise</code> - A promise with collected results if applicable.  
**Example**  
```js
// Run a command in collect mode
return lando.shell.sh(['ls', '-lsa', '/'], {mode: 'collect'})

// Catch and log any errors
.catch(err => {
  lando.log.error(err);
})

// Print the collected results of the command
.then(results => {
  console.log(results);
});
```
<div class="api-body-footer"></div>
<a id="landoshellwhich"></a>

<h2 id="landoshellwhich" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.shell.which(cmd) ⇒ <code>String</code> \| <code>null</code></h2>
<div class="api-body-header"></div>

Returns the path of a specific command or binary.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>String</code> | A command to search for. |

**Returns**: <code>String</code> \| <code>null</code> - The path to the command or null.  
**Example**  
```js
// Determine the location of the 'docker' command
const which = lando.shell.which(DOCKER_EXECUTABLE);
```
<div class="api-body-footer"></div>
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
<a id="landousergetuid"></a>

<h2 id="landousergetuid" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.user.getUid([username]) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns the id of the current user or username.

Note that on Windows this value is more or less worthless and `username` has
has no effect

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [username] | <code>String</code> | <code>&#x27;$(whoami)&#x27;</code> | The username to get the ID for |

**Returns**: <code>String</code> - The user ID.  
**Example**  
```js
// Get the id of the user.
const userId = lando.user.getUid();
```
<div class="api-body-footer"></div>
<a id="landousergetgid"></a>

<h2 id="landousergetgid" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.user.getGid([username]) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns the id of the current user or username.

Note that on Windows this value is more or less worthless and `username` has
has no effect

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [username] | <code>String</code> | <code>&#x27;$(whoami)&#x27;</code> | The username to get the ID for |

**Returns**: <code>String</code> - The group ID.  
**Example**  
```js
// Get the id of the user.
const groupId = lando.user.getGid();
```
<div class="api-body-footer"></div>
<a id="landoyamlload"></a>

<h2 id="landoyamlload" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.load(file) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Loads a yaml object from a file.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |

**Returns**: <code>Object</code> - The loaded object  
**Example**  
```js
// Add a string to the cache
const thing = lando.yaml.load('/tmp/myfile.yml');
```
<div class="api-body-footer"></div>
<a id="landoyamldump"></a>

<h2 id="landoyamldump" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.dump(file, data) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Dumps an object to a YAML file

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |
| data | <code>Object</code> | The object to dump |

**Returns**: <code>String</code> - Flename  
<div class="api-body-footer"></div>
