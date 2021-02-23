<a Mass59(massto)>="Lando"></a>

## Lando ⇒ [<code>Lando</code>](#Lando)
The class to instantiate a new Lando

Generally you will not need to do this unless you are using Lando to build your own
interface.

Check out `./bin/lando.js` in this repository for an example of how we instantiate
`lando` for usage in a CLI.

**Kind**: global variable  
**Returns**: [<code>Lando</code>](#Lando) - An initialized Lando instance  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Options to initialize a Lando object with |

**Example**  
```js
// Get a new lando instance
const Lando = require('lando');
const lando = new Lando({
  logLevelConsole: LOGLEVELCONSOLE,
  userConfRoot: USERCONFROOT,
  envPrefix: ENVPREFIX,
  configSources: configSources,
  pluginDirs: [USERCONFROOT],
  mode: 'cli'
});
```
<a name="event_pre_bootstrap_config"></a>

## lando.events:pre-bootstrap-config()
Event that runs before we bootstrap config.

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The lando object |

**Example**  
```js
lando.events.on('pre-bootstrap-config', lando => {
  // My codes
});
```
<a name="event_pre_bootstrap_tasks"></a>

## lando.events:pre-bootstrap-tasks()
Event that runs before we bootstrap tasks.

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The lando object |

**Example**  
```js
lando.events.on('pre-bootstrap-tasks', lando => {
  // My codes
});
```
<a name="event_pre_bootstrap_engine"></a>

## lando.events:pre-bootstrap-engine()
Event that runs before we bootstrap the engine.

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The lando object |

**Example**  
```js
lando.events.on('pre-bootstrap-engine', lando => {
  // My codes
});
```
<a name="event_pre_bootstrap_app"></a>

## lando.events:pre-bootstrap-app()
Event that runs before we bootstrap the app.

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The lando object |

**Example**  
```js
lando.events.on('pre-bootstrap-app', lando => {
  // My codes
});
```
<a name="event_post_bootstrap_config"></a>

## lando.events:post-bootstrap-config()
Event that runs after we bootstrap config

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The Lando object |

**Example**  
```js
lando.events.on('post-bootstrap-config', lando => {
  // My codes
});
```
<a name="event_post_bootstrap_tasks"></a>

## lando.events:post-bootstrap-tasks()
Event that runs after we bootstrap tasks

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The Lando object |

**Example**  
```js
lando.events.on('post-bootstrap-tasks', lando => {
  // My codes
});
```
<a name="event_post_bootstrap_engine"></a>

## lando.events:post-bootstrap-engine()
Event that runs after we bootstrap the engine

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The Lando object |

**Example**  
```js
lando.events.on('post-bootstrap-engine', lando => {
  // My codes
});
```
<a name="event_post_bootstrap_app"></a>

## lando.events:post-bootstrap-app()
Event that runs after we bootstrap the app

**Kind**: global function  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lando | [<code>Lando</code>](#Lando) | The Lando object |

**Example**  
```js
lando.events.on('post-bootstrap-app', lando => {
  // My codes
});
```
<a name="lando.bootstrap"></a>

## lando.bootstrap([level]) ⇒ <code>Promise</code>
Bootstraps Lando, this should

 1. Emit bootstrap events
 2. Auto detect and then load any plugins
 3. Augment the lando object with additional methods

You will want to use this after you instantiate `lando` via `new Lando(config)`. There
are four available bootstrap levels and each provides different things. The run in
the order presented.

     config     Autodetects and loads any plugins and merges their returns into
                the global config

     tasks      Autodetects and loads in any tasks along with recipe inits and
                init sources

     engine     Autodetects and moves any plugin scripts, adds `engine`, `shell`,
                `scanUrls` and `utils` to the lando instance

     app        Autodetects and loads in any `services` and `recipes` and also adds `yaml
                and `factory` to the lando instance.

Check out `./bin/lando.js` in this repository for an example of bootstraping
`lando` for usage in a CLI.

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise  
**Emits**: [<code>lando.events:pre-bootstrap-config</code>](#event_pre_bootstrap_config), [<code>lando.events:pre-bootstrap-tasks</code>](#event_pre_bootstrap_tasks), [<code>lando.events:pre-bootstrap-engine</code>](#event_pre_bootstrap_engine), [<code>lando.events:pre-bootstrap-app</code>](#event_pre_bootstrap_app), [<code>lando.events:post-bootstrap-config</code>](#event_post_bootstrap_config), [<code>lando.events:post-bootstrap-tasks</code>](#event_post_bootstrap_tasks), [<code>lando.events:post-bootstrap-engine</code>](#event_post_bootstrap_engine), [<code>lando.events:post-bootstrap-app</code>](#event_post_bootstrap_app)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [level] | <code>String</code> | <code>app</code> | Level with which to bootstrap Lando |

**Example**  
```js
// Bootstrap lando at default level and then exit
lando.bootstrap().then(() => process.exit(0))l
```
<a name="lando.getApp"></a>

## lando.getApp([startFrom], [warn]) ⇒ <code>App</code>
Gets a fully instantiated App instance.

Lando will also scan parent directories if no app is found in `startFrom`

**Kind**: global function  
**Returns**: <code>App</code> - Returns an instantiated App instandce.  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [startFrom] | <code>String</code> | <code>process.cwd()</code> | The directory to start looking for an app |
| [warn] | <code>Boolean</code> | <code>true</code> | Show a warning if we can't find an app |

**Example**  
```js
const app = lando.getApp('/path/to/my/app')
```
