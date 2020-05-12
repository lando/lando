<a name="app"></a>

## app ⇒ <code>App</code>
The class to instantiate a new App

**Kind**: global variable  
**Returns**: <code>App</code> - An App instance  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | Name of the app |
| config | <code>Object</code> |  | Config for the app |
| [lando] | <code>Object</code> | <code>{}</code> | A Lando instance |


* [app](#app) ⇒ <code>App</code>
    * [.shell](#app.shell)
    * [.config](#app.config)
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

<a name="app.shell"></a>

### app.shell
The apps shell

**Kind**: static property of [<code>app</code>](#app)  
**Since**: 3.0.0  
<a name="app.config"></a>

### app.config
The apps configuration

**Kind**: static property of [<code>app</code>](#app)  
**Since**: 3.0.0  
<a name="app.info"></a>

### app.info
Information about this app

**Kind**: static property of [<code>app</code>](#app)  
**Since**: 3.0.0  
<a name="app.root"></a>

### app.root
The apps root directory

**Kind**: static property of [<code>app</code>](#app)  
**Since**: 3.0.0  
<a name="app.tasks"></a>

### app.tasks
Tasks and commands the app can run

**Kind**: static property of [<code>app</code>](#app)  
**Since**: 3.0.0  
<a name="app.destroy"></a>

### app.destroy() ⇒ <code>Promise</code>
Hard removes all app services, volumes, networks, etc.

This differs from `uninstall` in that uninstall will only soft remove all app
services, while maintaining things like volumes, networks, etc.

That said this DOES call both `stop` and `uninstall` under the hood.

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>Promise</code> - A Promise  
**Emits**: [<code>pre\_destroy</code>](#event_pre_destroy), [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall), [<code>post\_destroy</code>](#event_post_destroy)  
**Since**: 3.0.0  
<a name="app.init"></a>

### app.init() ⇒ <code>Promise</code>
Initializes the app

You will want to run this to get the app ready for lando.engine. This will
load in relevant app plugins, build the docker compose files and get them ready to go

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>pre\_init</code>](#event_pre_init), [<code>post\_init</code>](#event_post_init), [<code>ready</code>](#event_ready)  
**Since**: 3.0.0  
<a name="app.rebuild"></a>

### app.rebuild() ⇒ <code>Promise</code>
Rebuilds an app.

This will stop an app, soft remove its services, rebuild those services and
then, finally, start the app back up again. This is useful for developers who
might want to tweak Dockerfiles or compose yamls.

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_rebuild</code>](#event_pre_rebuild), [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall), [<code>post\_rebuild</code>](#event_post_rebuild), [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  
<a name="app.restart"></a>

### app.restart(app) ⇒ <code>Promise</code>
Stops and then starts an app.

This just runs `app.stop` and `app.start` in succession.

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop), [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

<a name="app.start"></a>

### app.start() ⇒ <code>Promise</code>
Starts an app.

This will start up all services/containers that have been defined for this app.

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>pre\_start</code>](#event_pre_start), [<code>post\_start</code>](#event_post_start)  
**Since**: 3.0.0  
<a name="app.stop"></a>

### app.stop() ⇒ <code>Promise</code>
Stops an app.

This will stop all services/containers that have been defined for this app.

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>pre\_stop</code>](#event_pre_stop), [<code>post\_stop</code>](#event_post_stop)  
**Since**: 3.0.0  
<a name="app.uninstall"></a>

### app.uninstall(purge) ⇒ <code>Promise</code>
Soft removes the apps services but maintains persistent data like app volumes.

This differs from `destroy` in that destroy will hard remove all app services,
volumes, networks, etc as well as remove the app from the appRegistry.

**Kind**: static method of [<code>app</code>](#app)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>pre\_uninstall</code>](#event_pre_uninstall), [<code>post\_uninstall</code>](#event_post_uninstall)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| purge | <code>Boolean</code> | <code>false</code> | A fully instantiated app object |

<a name="event_pre_destroy"></a>

## "pre_destroy"
Event that runs before an app is destroyed.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post_destroy"></a>

## "post_destroy"
Event that runs after an app is destroyed.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre_init"></a>

## "pre_init"
Event that allows altering of the app object right before it is
initialized.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | <code>App</code> | The app instance. |

<a name="event_post_init"></a>

## "post_init"
Event that allows altering of the app object right after it has been
full initialized and all its plugins have been loaded.

**Kind**: event emitted  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | <code>App</code> | The app instance. |

<a name="event_ready"></a>

## "ready"
Event that runs when the app is ready for action

**Kind**: event emitted  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | <code>App</code> | The app instance. |

<a name="event_pre_rebuild"></a>

## "pre_rebuild"
Event that runs before an app is rebuilt.

**Kind**: event emitted  
<a name="event_post_rebuild"></a>

## "post_rebuild"
Event that runs after an app is rebuilt.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre_start"></a>

## "pre_start"
Event that runs before an app starts up.

This is useful if you want to start up any support services before an app
stars.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post_start"></a>

## "post_start"
Event that runs after an app is started.

This is useful if you want to perform additional operations after an app
starts such as running additional build commands.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre_stop"></a>

## "pre_stop"
Event that runs before an app stops.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post_stop"></a>

## "post_stop"
Event that runs after an app stop.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_pre_uninstall"></a>

## "pre_uninstall"
Event that runs before an app is uninstalled.

This is useful if you want to add or remove parts of the uninstall process.
For example, it might be nice to persist a container whose data you do not
want to replace in a rebuild and that cannot persist easily with a volume.

**Kind**: event emitted  
**Since**: 3.0.0  
<a name="event_post_uninstall"></a>

## "post_uninstall"
Event that runs after an app is uninstalled.

This is useful if you want to do some additional cleanup steps after an
app is uninstalled such as invalidating any cached data.

**Kind**: event emitted  
**Since**: 3.0.0  
