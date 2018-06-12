<a id="lando"></a>

<h2 id="lando" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando([options]) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Contains the main bootstrap function, which will:

  1. Instantiate the lando object.
  2. Emit bootstrap events
  3. Initialize plugins

You will want to use this to grab `lando` instead of using `new Lando(config)`.
The intiialization config in the example below is not required but recommended. You can
pass in any additional properties to override subsequently set/default values.

Check out `./bin/lando.js` in this repository for an example of bootstraping
`lando` for usage in a CLI.

**Emits**: [<code>pre_bootstrap</code>](#event_pre_bootstrap), [<code>post_bootstrap</code>](#event_post_bootstrap)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Options to initialize the bootstrap |

**Returns**: <code>Object</code> - An initialized Lando object  
**Example**  
```js
// Get the bootstrap function
const bootstrap = require('./lib/bootstrap');
const options = {
  logLevelConsole: LOGLEVELCONSOLE,
  userConfRoot: USERCONFROOT,
  envPrefix: ENVPREFIX,
  configSources: configSources,
  pluginDirs: [USERCONFROOT],
  mode: 'cli'
};

// Initialize Lando with some options
bootstrap(options).then(lando => cli.init(lando));
```
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
lando.events.on('pre-bootstrap', config => {
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
<a id="event_task_cmd_answers"></a>

<h2 id="event_task_cmd_answers" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "task_CMD_answers"</h2>
<div class="api-body-header"></div>

Event that allows altering of argv or inquirer before interactive prompts
are run

You will want to replace CMD with the actual task name eg `task-start-answers`.

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| answers | <code>Object</code> | argv and inquirer questions |

<div class="api-body-footer"></div>
<a id="event_task_cmd_run"></a>

<h2 id="event_task_cmd_run" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "task_CMD_run"</h2>
<div class="api-body-header"></div>

Event that allows final altering of answers before the task runs

You will want to replace CMD with the actual task name eg `task-start-run`.

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| answers | <code>Object</code> | object |

<div class="api-body-footer"></div>
<a id="landonode_"></a>

<h2 id="landonode_" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node._()</h2>
<div class="api-body-header"></div>

Get lodash

**Since**: 3.0.0  
**Example**  
```js
// Get the lodash module
const _ = lando.node._;
```
<div class="api-body-footer"></div>
<a id="landonodechalk"></a>

<h2 id="landonodechalk" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.chalk()</h2>
<div class="api-body-header"></div>

Get chalk

**Since**: 3.0.0  
**Example**  
```js
// Get the chalk module
const chalk = lando.node.chalk;
```
<div class="api-body-footer"></div>
<a id="landonodefs"></a>

<h2 id="landonodefs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.fs()</h2>
<div class="api-body-header"></div>

Get fs-extra

**Since**: 3.0.0  
**Example**  
```js
// Get the fs-extra module
const fs = lando.node.fs;
```
<div class="api-body-footer"></div>
<a id="landonodehasher"></a>

<h2 id="landonodehasher" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.hasher()</h2>
<div class="api-body-header"></div>

Get object-hash

**Since**: 3.0.0  
**Example**  
```js
// Get the object-hash module
const hasher = lando.node.hasher;
```
<div class="api-body-footer"></div>
<a id="landonodeip"></a>

<h2 id="landonodeip" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.ip()</h2>
<div class="api-body-header"></div>

Get ip utils

**Since**: 3.0.0  
**Example**  
```js
// Get the ip module
const ip = lando.node.ip;
```
<div class="api-body-footer"></div>
<a id="landonodejsonfile"></a>

<h2 id="landonodejsonfile" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.jsonfile()</h2>
<div class="api-body-header"></div>

Get jsonfile

**Since**: 3.0.0  
**Example**  
```js
// Get the jsonfile module
const jsonfile = lando.node.jsonfile;
```
<div class="api-body-footer"></div>
<a id="landonodeaxios"></a>

<h2 id="landonodeaxios" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.axios()</h2>
<div class="api-body-header"></div>

Get axios

**Since**: 3.0.0  
**Example**  
```js
// Get the axios module
const rest = lando.node.axios;

// Get it via the legacy hostname
const rest = lando.node.rest
```
<div class="api-body-footer"></div>
<a id="landonodesemver"></a>

<h2 id="landonodesemver" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.semver()</h2>
<div class="api-body-header"></div>

Get semver

**Since**: 3.0.0  
**Example**  
```js
// Get the semver module
const semver = lando.node.semver;
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
<a id="landotaskstasks"></a>

<h2 id="landotaskstasks" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.tasks.tasks()</h2>
<div class="api-body-header"></div>

A singleton array that contains all the tasks that have been added.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
const task = lando.tasks.tasks;
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
<a id="landocliargv"></a>

<h2 id="landocliargv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.argv() ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Returns a parsed array of CLI arguments and options

**Since**: 3.0.0  
**Todo**

- [ ] make this static and then fix all call sites

**Returns**: <code>Object</code> - Yarg parsed options  
**Example**  
```js
const argv = lando.cli.argv();
```
<div class="api-body-footer"></div>
<a id="landoclicheckperms"></a>

<h2 id="landoclicheckperms" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.checkPerms()</h2>
<div class="api-body-header"></div>

Checks to see if lando is running with sudo. If it is it
will exit the process with a stern warning

**Since**: 3.0.0  
**Example**  
```js
lando.cli.checkPerms()
```
<div class="api-body-footer"></div>
<a id="landoclilargv"></a>

<h2 id="landoclilargv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.largv([args]) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Returns a parsed object of all global options.

This means all the options passed in after the `--` flag.

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [args] | <code>Object</code> | <code>process.argv.slice(2)</code> | Options |

**Returns**: <code>Object</code> - Yarg parsed options  
**Example**  
```js
const largv = lando.cli.largv();
```
<div class="api-body-footer"></div>
<a id="landoclidefaultconfig"></a>

<h2 id="landoclidefaultconfig" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.defaultConfig() ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Returns a config object with some good default settings for bootstrapping
lando as a command line interface

**Since**: 3.0.0  
**Returns**: <code>Object</code> - Config that can be used in a Lando CLI bootstrap  
**Example**  
```js
const config = lando.cli.defaultConfig();
// Kick off our bootstrap
bootstrap(config).then(lando => console.log(lando));
```
<div class="api-body-footer"></div>
<a id="landoclimakeart"></a>

<h2 id="landoclimakeart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.makeArt([header], [opts]) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Returns some cli "art"

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [header] | <code>String</code> | <code>&#x27;start&#x27;</code> | The type of header you want to get |
| [opts] | <code>Object</code> |  | Padding options |
| [opts.paddingTop] | <code>Object</code> | <code>1</code> | Lines to pad on top of the art |
| [opts.paddingBottom] | <code>Object</code> | <code>1</code> | Lines to pad below the art |

**Returns**: <code>Object</code> - Yarg parsed options  
**Example**  
```js
console.log(lando.cli.makeArt('init', {paddingTop: 100});
```
<div class="api-body-footer"></div>
<a id="landoclimaketable"></a>

<h2 id="landoclimaketable" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.makeTable([opts]) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Utility function to help construct CLI displayable tables

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> |  | Options for how the table should be built |
| [opts.arrayJoiner] | <code>String</code> | <code>&#x27;, &#x27;</code> | A delimiter to be used when joining array data |

**Returns**: <code>Object</code> - Table metadata that can be printed with toString()  
**Example**  
```js
// Grab a new cli table
const table = new lando.cli.makeTable();

// Add data
table.add('NAME', app.name);
table.add('LOCATION', app.root);
table.add('SERVICES', _.keys(app.services));
table.add('URLS', urls, {arrayJoiner: '\n'});

// Print the table
console.log(table.toString());
```
<div class="api-body-footer"></div>
<a id="landocliparsetoyargs"></a>

<h2 id="landocliparsetoyargs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.parseToYargs(task, [events]) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.

A lando task object is an abstraction on top of yargs that also contains some
metadata about how to interactively ask questions on both a CLI and GUI.

**See**

- [yargs docs](http://yargs.js.org/docs/)
- [inquirer docs](https://github.com/sboudrias/Inquirer.js)

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| task | <code>Object</code> |  | A Lando task object (@see add for definition) |
| [events] | <code>Object</code> | <code>new AsyncEvents()</code> | An AsyncEvents |

**Returns**: <code>Object</code> - A yargs command object  
**Example**  
```js
// Add a task to the yargs CLI
yargs.command(lando.tasks.parseToYargs(task));
```
<div class="api-body-footer"></div>
<a id="landoutilsconfigtryconvertjson"></a>

<h2 id="landoutilsconfigtryconvertjson" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.tryConvertJson(value) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Attempt to parse a JSON string to an objects

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>String</code> | The string to convert |

**Returns**: <code>Object</code> - A parsed object or the inputted value  
<div class="api-body-footer"></div>
<a id="landoutilsconfigmerge"></a>

<h2 id="landoutilsconfigmerge" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.merge(old, fresh) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Uses _.mergeWith to concat arrays, this helps replicate how Docker Compose
merges its things

**See**: https://lodash.com/docs#mergeWith  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| old | <code>Object</code> | object to be merged |
| fresh | <code>Object</code> | object to be merged |

**Returns**: <code>Object</code> - The new object  
**Example**  
```js
// Take an object and write a docker compose file
const newObject = _.mergeWith(a, b, lando.utils.merger);
```
<div class="api-body-footer"></div>
<a id="landoutilsconfigstripenv"></a>

<h2 id="landoutilsconfigstripenv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.stripEnv(prefix) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Strips process.env of all envvars with PREFIX and returns process.env

NOTE: this actually returns process.env not a NEW object cloned from process.env

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>String</code> | The prefix to strip |

**Returns**: <code>Object</code> - Updated process.env  
**Example**  
```js
// Reset the process.env without any DOCKER_ prefixed envvars
process.env = config.stripEnv('DOCKER_');
```
<div class="api-body-footer"></div>
<a id="landoutilsconfigdefaults"></a>

<h2 id="landoutilsconfigdefaults" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.defaults() ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Define default config

**Since**: 3.0.0  
**Returns**: <code>Object</code> - The default config object.  
<div class="api-body-footer"></div>
<a id="landoutilsconfigloadfiles"></a>

<h2 id="landoutilsconfigloadfiles" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.loadFiles(files) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Merge in config file if it exists

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array</code> | An array of files to try loading |

**Returns**: <code>Object</code> - An object of config merged from file sources  
<div class="api-body-footer"></div>
<a id="landoutilsconfigloadenvs"></a>

<h2 id="landoutilsconfigloadenvs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.loadEnvs(prefix) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Filter process.env by a given prefix

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>String</code> | The prefix by which to filter. Should be without the trailing `_` eg `LANDO` not `LANDO_` |

**Returns**: <code>Object</code> - Object of things with camelCased keys  
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
lando.log.error('This is an err with details %j', err);
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
  lando.plugins.load(plugin, dirs, [injected]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Loads a plugin.

For each directory scanned plugins can live in either the `plugins` or
`node_modules` subdirectories

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>String</code> | The name of the plugin |
| dirs | <code>Array</code> | The directories to scan for plugins. |
| [injected] | <code>Object</code> | An object to inject into the plugin. |

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
| [opts.app] | <code>Boolean</code> | <code>{}</code> | A Lando app object |
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
<a id="landoshellescspaces"></a>

<h2 id="landoshellescspaces" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.shell.escSpaces(s, platform) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Escapes any spaces in a command.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>Array</code> \| <code>String</code> | A command as elements of an Array or a String. |
| platform | <code>String</code> | Specify a platform to escape for |

**Returns**: <code>String</code> - The space escaped cmd.  
**Example**  
```js
// Escape the spaces in the cmd
const escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
```
<div class="api-body-footer"></div>
<a id="landoshellesc"></a>

<h2 id="landoshellesc" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.shell.esc(cmd) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Escapes special characters in a command to make it more exec friendly.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>Array</code> | A command as elements of an Array. |

**Returns**: <code>String</code> - The escaped cmd.  
**Example**  
```js
// Escape the cmd
const escapedCmd = lando.shell.esc(['git', 'commit', '-m', 'my message']);
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
<a id="landotasksadd"></a>

<h2 id="landotasksadd" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.tasks.add(name, task) ⇒ <code>Array</code></h2>
<div class="api-body-header"></div>

Adds a Lando task to the global `lando.tasks.task` object.

A lando task object is an abstraction on top of [yargs](http://yargs.js.org/docs/)
and [inquirer](https://github.com/sboudrias/Inquirer.js) with a little extra special sauce.

**See**

- [yargs docs](http://yargs.js.org/docs/)
- [inquirer docs](https://github.com/sboudrias/Inquirer.js)

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the task. |
| task | <code>Object</code> | A Lando task object |
| task.command | <code>String</code> | A [yargs formatted command](http://yargs.js.org/docs/#methods-commandmodule-positional-arguments) |
| task.description | <code>String</code> | A short description of the command |
| task.options | <code>Object</code> | A [yargs builder object](http://yargs.js.org/docs/#methods-commandmodule). Each builder also has an 'interactive' key which is an [inquirier question object](https://github.com/sboudrias/Inquirer.js#objects) |
| task.run | <code>function</code> | The function to run when the task is invoked. |
| task.run.options | <code>Object</code> | The options selected by the user, available to the run function. |

**Returns**: <code>Array</code> - The task object  
**Example**  
```js
// Define a task
const task = {
  command: 'destroy [appname]',
  describe: 'Destroy app in current directory or [appname]',
  options: {
    yes: {
      describe: 'Auto answer yes to prompts',
      alias: ['y'],
      default: false,
      boolean: true,
      interactive: {
        type: 'confirm',
        message: 'Are you sure you want to DESTROY?',
      },
    },
  },
  run: options => {
    console.log(options);
  }
};

// Add the task to Lando
lando.tasks.add('destroy', task);
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
