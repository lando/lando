<a id="app"></a>

<h2 id="app" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app ⇒ <code>App</code></h2>
<div class="api-body-header"></div>

The class to instantiate a new App

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | Name of the app |
| config | <code>Object</code> |  | Config for the app |
| [lando] | <code>Object</code> | <code>{}</code> | A Lando instance |

**Returns**: <code>App</code> - An App instance  
<div class="api-body-footer"></div>

* [app](#app) ⇒ <code>App</code>
    * [.config](#app.config)
    * [.events](#app.events)
    * [.info](#app.info)
    * [.root](#app.root)
    * [.tasks](#app.tasks)
    * [.destroy()](#app.destroy) ⇒ <code>Promise</code>
    * [.init()](#app.init) ⇒ <code>Promise</code>
    * [.rebuild()](#app.rebuild) ⇒ <code>Promise</code>
    * [.restart(app)](#app.restart) ⇒ <code>Promise</code>
    * [.start()](#app.start) ⇒ <code>Promise</code>
    * [.stop()](#app.stop) ⇒ <code>Promise</code>
    * [.uninstall(purge)](#app.uninstall) ⇒ <code>Promise</code>

<a id="appconfig"></a>

<h2 id="appconfig" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.config</h2>
<div class="api-body-header"></div>

The apps configuration

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="appevents"></a>

<h2 id="appevents" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.events</h2>
<div class="api-body-header"></div>

The apps event emitter

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="appinfo"></a>

<h2 id="appinfo" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.info</h2>
<div class="api-body-header"></div>

Information about this app

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="approot"></a>

<h2 id="approot" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.root</h2>
<div class="api-body-header"></div>

The apps root directory

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="apptasks"></a>

<h2 id="apptasks" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.tasks</h2>
<div class="api-body-header"></div>

Tasks and commands the app can run

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="appdestroy"></a>

<h2 id="appdestroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.destroy() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Hard removes all app services, volumes, networks, etc.

This differs from `uninstall` in that uninstall will only soft remove all app
services, while maintaining things like volumes, networks, etc.

That said this DOES call both `stop` and `uninstall` under the hood.

**Emits**: [<code>pre\_destroy</code>](#event_pre_destroy), [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall), [<code>post\_destroy</code>](#event_post_destroy)  
**Since**: 3.0.0  
**Returns**: <code>Promise</code> - A Promise  
<div class="api-body-footer"></div>
<a id="appinit"></a>

<h2 id="appinit" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.init() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Initializes the app

You will want to run this to get the app ready for lando.engine. This will
load in relevant app plugins, build the docker compose files and get them ready to go

**Emits**: [<code>pre\_init</code>](#event_pre_init), [<code>post\_init</code>](#event_post_init), [<code>ready</code>](#event_ready)  
**Since**: 3.0.0  
**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="apprebuild"></a>

<h2 id="apprebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.rebuild() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Rebuilds an app.

This will stop an app, soft remove its services, rebuild those services and
then, finally, start the app back up again. This is useful for developers who
might want to tweak Dockerfiles or compose yamls.

**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_rebuild</code>](#event_pre_rebuild), [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall), [<code>post\_rebuild</code>](#event_post_rebuild), [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  
**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="apprestart"></a>

<h2 id="apprestart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.restart(app) ⇒ <code>Promise</code></h2>
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
<a id="appstart"></a>

<h2 id="appstart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.start() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Starts an app.

This will start up all services/containers that have been defined for this app.

**Emits**: [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  
**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="appstop"></a>

<h2 id="appstop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.stop() ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Stops an app.

This will stop all services/containers that have been defined for this app.

**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop)  
**Since**: 3.0.0  
**Returns**: <code>Promise</code> - A Promise.  
<div class="api-body-footer"></div>
<a id="appuninstall"></a>

<h2 id="appuninstall" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  app.uninstall(purge) ⇒ <code>Promise</code></h2>
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
<a id="event_pre_init"></a>

<h2 id="event_pre_init" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_init"</h2>
<div class="api-body-header"></div>

Event that allows altering of the app object right before it is
initialized.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | <code>App</code> | The app instance. |

<div class="api-body-footer"></div>
<a id="event_post_init"></a>

<h2 id="event_post_init" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_init"</h2>
<div class="api-body-header"></div>

Event that allows altering of the app object right after it has been
full initialized and all its plugins have been loaded.

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | <code>App</code> | The app instance. |

<div class="api-body-footer"></div>
<a id="event_ready"></a>

<h2 id="event_ready" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "ready"</h2>
<div class="api-body-header"></div>

Event that runs when the app is ready for action

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | <code>App</code> | The app instance. |

<div class="api-body-footer"></div>
<a id="event_pre_rebuild"></a>

<h2 id="event_pre_rebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_rebuild"</h2>
<div class="api-body-header"></div>

Event that runs before an app is rebuilt.

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
