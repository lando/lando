<a id="lando"></a>

<h2 id="lando" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  Lando ⇒ [<code>Lando</code>](#Lando)</h2>
<div class="api-body-header"></div>

The class to instantiate a new Lando

Generally you will not need to do this unless you are using Lando to build your own
interface.

Check out `./bin/lando.js` in this repository for an example of how we instantiate
`lando` for usage in a CLI.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Options to initialize a Lando object with |

**Returns**: [<code>Lando</code>](#Lando) - An initialized Lando instance  
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
<div class="api-body-footer"></div>
<a id="event_pre_bootstrap_config"></a>

<h2 id="event_pre_bootstrap_config" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:pre-bootstrap-config()</h2>
<div class="api-body-header"></div>

Event that runs before we bootstrap config.

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
<div class="api-body-footer"></div>
<a id="event_pre_bootstrap_tasks"></a>

<h2 id="event_pre_bootstrap_tasks" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:pre-bootstrap-tasks()</h2>
<div class="api-body-header"></div>

Event that runs before we bootstrap tasks.

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
<div class="api-body-footer"></div>
<a id="event_pre_bootstrap_engine"></a>

<h2 id="event_pre_bootstrap_engine" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:pre-bootstrap-engine()</h2>
<div class="api-body-header"></div>

Event that runs before we bootstrap the engine.

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
<div class="api-body-footer"></div>
<a id="event_pre_bootstrap_app"></a>

<h2 id="event_pre_bootstrap_app" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:pre-bootstrap-app()</h2>
<div class="api-body-header"></div>

Event that runs before we bootstrap the app.

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
<div class="api-body-footer"></div>
<a id="event_post_bootstrap_config"></a>

<h2 id="event_post_bootstrap_config" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:post-bootstrap-config()</h2>
<div class="api-body-header"></div>

Event that runs after we bootstrap config

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
<div class="api-body-footer"></div>
<a id="event_post_bootstrap_tasks"></a>

<h2 id="event_post_bootstrap_tasks" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:post-bootstrap-tasks()</h2>
<div class="api-body-header"></div>

Event that runs after we bootstrap tasks

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
<div class="api-body-footer"></div>
<a id="event_post_bootstrap_engine"></a>

<h2 id="event_post_bootstrap_engine" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:post-bootstrap-engine()</h2>
<div class="api-body-header"></div>

Event that runs after we bootstrap the engine

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
<div class="api-body-footer"></div>
<a id="event_post_bootstrap_app"></a>

<h2 id="event_post_bootstrap_app" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events:post-bootstrap-app()</h2>
<div class="api-body-header"></div>

Event that runs after we bootstrap the app

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
<div class="api-body-footer"></div>
<a id="landobootstrap"></a>

<h2 id="landobootstrap" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.bootstrap([level]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

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

**Emits**: [<code>lando.events:pre-bootstrap-config</code>](#event_pre_bootstrap_config), [<code>lando.events:pre-bootstrap-tasks</code>](#event_pre_bootstrap_tasks), [<code>lando.events:pre-bootstrap-engine</code>](#event_pre_bootstrap_engine), [<code>lando.events:pre-bootstrap-app</code>](#event_pre_bootstrap_app), [<code>lando.events:post-bootstrap-config</code>](#event_post_bootstrap_config), [<code>lando.events:post-bootstrap-tasks</code>](#event_post_bootstrap_tasks), [<code>lando.events:post-bootstrap-engine</code>](#event_post_bootstrap_engine), [<code>lando.events:post-bootstrap-app</code>](#event_post_bootstrap_app)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [level] | <code>String</code> | <code>app</code> | Level with which to bootstrap Lando |

**Returns**: <code>Promise</code> - A Promise  
**Example**  
```js
// Bootstrap lando at default level and then exit
lando.bootstrap().then(() => process.exit(0))l
```
<div class="api-body-footer"></div>
<a id="landogetapp"></a>

<h2 id="landogetapp" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.getApp([startFrom], [warn]) ⇒ <code>App</code></h2>
<div class="api-body-header"></div>

Gets a fully instantiated App instance.

Lando will also scan parent directories if no app is found in `startFrom`

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [startFrom] | <code>String</code> | <code>process.cwd()</code> | The directory to start looking for an app |
| [warn] | <code>Boolean</code> | <code>true</code> | Show a warning if we can't find an app |

**Returns**: <code>App</code> - Returns an instantiated App instandce.  
**Example**  
```js
const app = lando.getApp('/path/to/my/app')
```
<div class="api-body-footer"></div>
