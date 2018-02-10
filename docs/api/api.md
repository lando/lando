<a id="lando"></a>

<h2 id="lando" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Contains the main bootstrap function, which will:

  1. Instantiate the lando object.
  2. Emit bootstrap events
  3. Initialize plugins

You will want to use this to grab `lando` instead of using `require('lando')(config)`.
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
var bootstrap = require('lando/lib/bootstrap');
var options = {
  logLevelConsole: LOGLEVELCONSOLE,
  userConfRoot: USERCONFROOT,
  envPrefix: ENVPREFIX,
  configSources: configSources,
  pluginDirs: [USERCONFROOT],
  mode: 'cli'
};

// Initialize Lando with some options
bootstrap(options)

// Initialize some other things
.then(function(lando) {
  return cli.init(lando);
})
```
<div class="api-body-footer"></div>
<a id="landoclilargv"></a>

<h2 id="landoclilargv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.largv</h2>
<div class="api-body-header"></div>

A singleton object that contains the Lando global options.

This means all the options passed in after the `--` flag.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var largv = lando.tasks.largv;
```
<div class="api-body-footer"></div>
<a id="landoevents"></a>

<h2 id="landoevents" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events</h2>
<div class="api-body-header"></div>

This extends the core node event emitter except where otherwise documented
below

**See**: https://nodejs.org/api/events.html  
<div class="api-body-footer"></div>
<a id="landoevents__on"></a>

<h2 id="landoevents__on" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events.__on</h2>
<div class="api-body-header"></div>

Stores the original event on method.

I don't think you want to ever really use this. Mentioned only for transparency.

**See**: https://nodejs.org/api/events.html  
<div class="api-body-footer"></div>
<a id="landoevents__emit"></a>

<h2 id="landoevents__emit" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.events.__emit</h2>
<div class="api-body-header"></div>

Stores the original event emit method.

I don't think you want to ever really use this. Mentioned only for transparency.

**See**: https://nodejs.org/api/events.html  
<div class="api-body-footer"></div>
<a id="landonode_"></a>

<h2 id="landonode_" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node._</h2>
<div class="api-body-header"></div>

Get lodash

**Since**: 3.0.0  
**Example**  
```js
// Get the lodash module
var _ = lando.node._;
```
<div class="api-body-footer"></div>
<a id="landonodechalk"></a>

<h2 id="landonodechalk" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.chalk</h2>
<div class="api-body-header"></div>

Get chalk

**Since**: 3.0.0  
**Example**  
```js
// Get the chalk module
var chalk = lando.node.chalk;
```
<div class="api-body-footer"></div>
<a id="landonodefs"></a>

<h2 id="landonodefs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.fs</h2>
<div class="api-body-header"></div>

Get fs-extra

**Since**: 3.0.0  
**Example**  
```js
// Get the fs-extra module
var fs = lando.node.fs;
```
<div class="api-body-footer"></div>
<a id="landonodehasher"></a>

<h2 id="landonodehasher" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.hasher</h2>
<div class="api-body-header"></div>

Get object-hash

**Since**: 3.0.0  
**Example**  
```js
// Get the object-hash module
var hasher = lando.node.hasher;
```
<div class="api-body-footer"></div>
<a id="landonodeip"></a>

<h2 id="landonodeip" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.ip</h2>
<div class="api-body-header"></div>

Get ip utils

**Since**: 3.0.0  
**Example**  
```js
// Get the ip module
var ip = lando.node.ip;
```
<div class="api-body-footer"></div>
<a id="landonodejsonfile"></a>

<h2 id="landonodejsonfile" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.jsonfile</h2>
<div class="api-body-header"></div>

Get jsonfile

**Since**: 3.0.0  
**Example**  
```js
// Get the jsonfile module
var jsonfile = lando.node.jsonfile;
```
<div class="api-body-footer"></div>
<a id="landonoderest"></a>

<h2 id="landonoderest" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.rest</h2>
<div class="api-body-header"></div>

Get restler

**Since**: 3.0.0  
**Example**  
```js
// Get the restler module
var rest = lando.node.rest;
```
<div class="api-body-footer"></div>
<a id="landonodesemver"></a>

<h2 id="landonodesemver" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.node.semver</h2>
<div class="api-body-header"></div>

Get semver

**Since**: 3.0.0  
**Example**  
```js
// Get the semver module
var semver = lando.node.semver;
```
<div class="api-body-footer"></div>
<a id="landopromise"></a>

<h2 id="landopromise" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.Promise</h2>
<div class="api-body-header"></div>

Extends [bluebird](http://bluebirdjs.com/docs/api-reference.html)
so that our promises have some retry functionality.

All functionality should be the same as bluebird except where indicated
below

**See**: http://bluebirdjs.com/docs/api-reference.html  
<div class="api-body-footer"></div>
<a id="landotaskstasks"></a>

<h2 id="landotaskstasks" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.tasks.tasks</h2>
<div class="api-body-header"></div>

A singleton array that contains all the tasks that have been added.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
var task = lando.tasks.tasks;
```
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
var data = lando.cache.get('mykey');
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
<a id="landoutilsconfigmerge"></a>

<h2 id="landoutilsconfigmerge" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.merge()</h2>
<div class="api-body-header"></div>

Uses _.mergeWith to concat arrays, this helps replicate how Docker
Compose merges its things

**Since**: 3.0.0  
**Example**  
```js
// Take an object and write a docker compose file
var newObject = _.mergeWith(a, b, lando.utils.merger);
```
<div class="api-body-footer"></div>
<a id="landoutilsconfigupdatepath"></a>

<h2 id="landoutilsconfigupdatepath" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.updatePath(dir) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Updates the PATH with dir. This adds dir to the beginning of PATH.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>String</code> | The dir to add |

**Returns**: <code>String</code> - Updated PATH string  
**Example**  
```js
// Update the path
var config.path = config.updatePath(path);
```
<div class="api-body-footer"></div>
<a id="landoutilsconfigstripenv"></a>

<h2 id="landoutilsconfigstripenv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.stripEnv(prefix) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Strips process.env of all envvars with PREFIX

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>String</code> | The prefix to strip |

**Returns**: <code>Object</code> - Updated process.env  
**Example**  
```js
// Reset the process.env without any LANDO_ prefixed envvars
process.env = config.stripEnv('LANDO_');
```
<div class="api-body-footer"></div>
<a id="landoutilsconfigdefaults"></a>

<h2 id="landoutilsconfigdefaults" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.defaults()</h2>
<div class="api-body-header"></div>

Define default config

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsconfigloadfiles"></a>

<h2 id="landoutilsconfigloadfiles" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.loadFiles()</h2>
<div class="api-body-header"></div>

Merge in config file if it exists

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsconfigloadenvs"></a>

<h2 id="landoutilsconfigloadenvs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.config.loadEnvs()</h2>
<div class="api-body-header"></div>

Grab envvars and map to config

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landocliargv"></a>

<h2 id="landocliargv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.argv()</h2>
<div class="api-body-header"></div>

Returns the lando options

This means all the options passed in before the `--` flag.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var argv = lando.tasks.argv();
```
<div class="api-body-footer"></div>
<a id="landocliparsetoyargs"></a>

<h2 id="landocliparsetoyargs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.parseToYargs(task, events) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.

A lando task object is an abstraction on top of yargs that also contains some
metadata about how to interactively ask questions on both a CLI and GUI.

The interactivity metadata is a superset of [inquirer](https://github.com/sboudrias/Inquirer.js) data.

**See**

- [yargs docs](http://yargs.js.org/docs/)
- [inquirer docs](https://github.com/sboudrias/Inquirer.js)

**Since**: 3.0.0  
**Todo**

- [ ] Injecting the events here seems not the way we want to go?


| Param | Type | Description |
| --- | --- | --- |
| task | <code>Object</code> | A Lando task object (@see add for definition) |
| events | <code>Object</code> | The Lando events engine |

**Returns**: <code>Object</code> - A yargs command object  
**Example**  
```js
// Add a task to the yargs CLI
yargs.command(lando.tasks.parseToYargs(task));
```
<div class="api-body-footer"></div>
<a id="landoclistartheader"></a>

<h2 id="landoclistartheader" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.startHeader() ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns a cheeky header that can be used after an app is started.

**Since**: 3.0.0  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.startHeader());
```
<div class="api-body-footer"></div>
<a id="landocliinitheader"></a>

<h2 id="landocliinitheader" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.initHeader() ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns a cheeky header that can be used after an app is init.

**Since**: 3.0.0  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.initHeader());
```
<div class="api-body-footer"></div>
<a id="landoclitunnelheader"></a>

<h2 id="landoclitunnelheader" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.tunnelHeader() ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns a cheeky header that can be used after an app is shared

**Since**: 3.0.0  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.tunnelHeader());
```
<div class="api-body-footer"></div>
<a id="landocliupdatemessage"></a>

<h2 id="landocliupdatemessage" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.updateMessage(url) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns a mesage indicating the availability of an update

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL with the link to the update |

**Returns**: <code>String</code> - An update message we can print to the CLI  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.updateMessage());
```
<div class="api-body-footer"></div>
<a id="landoclitable"></a>

<h2 id="landoclitable" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.Table([opts]) ⇒ <code>Object</code></h2>
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
var table = new lando.cli.Table();

// Add data
table.add('NAME', app.name);
table.add('LOCATION', app.root);
table.add('SERVICES', _.keys(app.services));
table.add('URLS', urls, {arrayJoiner: '\n'});

// Print the table
console.log(table.toString());
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
lando.events.on('post-instantiate-app', 1, function(app) {
  console.log(app);
});

// Log a helpful message after an app is started, don't worry about whether it runs before or
// after other `post-start` events
return app.events.on('post-start', function() {
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
  lando.plugins.load(plugin, dirs, [inject]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Loads a plugin.

For each directory scanned plugins can live in either the `plugins` or
`node_modules` subdirectories

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>String</code> | The name of the plugin |
| dirs | <code>Array</code> | The directories to scan for plugins. |
| [inject] | <code>Object</code> | An object to inject into the plugin. |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Load the plugin called 'shield-generator' and additionally scan `/tmp` for the plugin
return lando.plugins.load('shield-generator', ['/tmp']);
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
// Start the deamon
return serviceCmd(['start'], opts)

// And then retry 25 times until we've connected, increase delay between retries by 1 second
.retry(function() {
  log.verbose('Trying to connect to daemon.');
  return shell.sh([DOCKER_EXECUTABLE, 'info'], {mode: 'collect'});
}, {max: 25, backoff: 1000});
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
| [opts.waitCode] | <code>Array</code> | <code>[400, 502</code> | The HTTP codes to prompt a retry. |

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

Beyond the options specified below you should be able to pass in known [exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
or [spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) options depending on whether we have a mode or not.

**See**

- [extra exec options](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
- [extra spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>Array</code> | The command to run as elements in an array or a string. |
| [opts] | <code>Object</code> | Options to help determine how the exec is run. |
| [opts.detached] | <code>Boolean</code> | Whether we are running in detached mode or not (deprecated) |

**Returns**: <code>Promise</code> - A promise with collected results if applicable.  
**Example**  
```js
// Run a command in collect mode
return lando.shell.sh(['ls', '-lsa', '/'], {mode: 'collect'})

// Catch and log any errors
.catch(function(err) {
  lando.log.error(err);
})

// Print the collected results of the command
.then(function(results) {
  console.log(results);
});
```
<div class="api-body-footer"></div>
<a id="landoshellescspaces"></a>

<h2 id="landoshellescspaces" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.shell.escSpaces(s) ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Escapes any spaces in a command.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>Array</code> | A command as elements of an Array or a String. |

**Returns**: <code>String</code> - The space escaped cmd.  
**Example**  
```js
// Escape the spaces in the cmd
var escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
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
| cmd | <code>Array</code> | A command as elements of an Array or a String. |

**Returns**: <code>String</code> - The escaped cmd.  
**Example**  
```js
// Escape the cmd
var escapedCmd = lando.shell.esc(['git', 'commit', '-m', 'my message']);
```
<div class="api-body-footer"></div>
<a id="landoshellwhich"></a>

<h2 id="landoshellwhich" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.shell.which(cmd) ⇒ <code>String</code> \| <code>undefined</code></h2>
<div class="api-body-header"></div>

Returns the path of a specific command or binary.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>String</code> | A command to search for. |

**Returns**: <code>String</code> \| <code>undefined</code> - The path to the command or `undefined`.  
**Example**  
```js
// Determine the location of the 'docker' command
var which = lando.shell.which(DOCKER_EXECUTABLE);
```
<div class="api-body-footer"></div>
<a id="landotasksadd"></a>

<h2 id="landotasksadd" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.tasks.add(name, task)</h2>
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

**Example**  
```js
// Define a task
var task = {
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
        message: 'Are you sure you want to DESTROY?'
      }
    }
  },
  run: function(options) {
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
var updateAvailable = lando.updates.updateAvailable('1.0.0', '1.0.1');
```
<div class="api-body-footer"></div>
<a id="landoupdatesfetch"></a>

<h2 id="landoupdatesfetch" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.updates.fetch()</h2>
<div class="api-body-header"></div>

Determines whether we need to fetch updatest or not

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoupdatesrefresh"></a>

<h2 id="landoupdatesrefresh" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.updates.refresh()</h2>
<div class="api-body-header"></div>

Get latest version info from github

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landousergetuid"></a>

<h2 id="landousergetuid" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.user.getUid() ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns the id of the user.

Note that on Windows this value is more or less worthless.

**Since**: 3.0.0  
**Returns**: <code>String</code> - The user ID.  
**Example**  
```js
// Get the id of the user.
var userId = lando.user.getEngineUserId();
```
<div class="api-body-footer"></div>
<a id="landousergetgid"></a>

<h2 id="landousergetgid" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.user.getGid() ⇒ <code>String</code></h2>
<div class="api-body-header"></div>

Returns the group id of the user.

Note that on Windows this value is more or less worthless.

**Since**: 3.0.0  
**Returns**: <code>String</code> - The group ID.  
**Example**  
```js
// Get the id of the user.
var groupId = lando.user.getEngineUserGid();
```
<div class="api-body-footer"></div>
<a id="landoyamlload"></a>

<h2 id="landoyamlload" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.load(file) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Loads a yaml object from a file

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |

**Returns**: <code>Object</code> - The loaded object  
**Example**  
```js
// Add a string to the cache
var thing = lando.yaml.load('/tmp/myfile.yml');
```
<div class="api-body-footer"></div>
<a id="landoyamldump"></a>

<h2 id="landoyamldump" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.dump(file, data) ⇒</h2>
<div class="api-body-header"></div>

Dumps an object to a YAML file

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |
| data | <code>Object</code> | The object to dump |

**Returns**: - Flename  
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
  lando.app.cleanup(app) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Does some helpful cleanup before running an app operation.

This command helps clean up apps in an inconsistent state and any orphaned
containers they may have.

**Since**: 3.0.0  
**Todo**

- [ ] Should this be an internal method? Or can we deprecate at some point?


| Param | Type | Description |
| --- | --- | --- |
| app | <code>Object</code> | A fully instantiated app object |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Do the app cleanup
return lando.app.cleanup(app)
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
<a id="landoutilsappappnameexists"></a>

<h2 id="landoutilsappappnameexists" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.app.appNameExists()</h2>
<div class="api-body-header"></div>

Checks if there is already an app with the same name in an app _registry
object

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsappvalidatefiles"></a>

<h2 id="landoutilsappvalidatefiles" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.app.validateFiles()</h2>
<div class="api-body-header"></div>

Validates compose files returns legit ones

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsappcompose"></a>

<h2 id="landoutilsappcompose" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.app.compose()</h2>
<div class="api-body-header"></div>

Takes data and spits out a compose object

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsappstarttable"></a>

<h2 id="landoutilsappstarttable" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.app.startTable()</h2>
<div class="api-body-header"></div>

Returns a CLI table with app start metadata info

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsappgeturls"></a>

<h2 id="landoutilsappgeturls" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.app.getUrls()</h2>
<div class="api-body-header"></div>

Takes inspect data and extracts all the exposed ports

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsappgetinfodefaults"></a>

<h2 id="landoutilsappgetinfodefaults" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.app.getInfoDefaults()</h2>
<div class="api-body-header"></div>

Returns a default info object

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoutilsappmetricsparse"></a>

<h2 id="landoutilsappmetricsparse" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.utils.app.metricsParse()</h2>
<div class="api-body-header"></div>

Helper to parse metrics data

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
lando.events.on('pre-bootstrap', function(config) {

  // Get the docker config
  var engineConfig = daemon.getEngineConfig();

  // Add engine host to the config
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
lando.events.on('post-bootstrap', function(lando) {
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

task-CMD-answers

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

Event that allows final altering of answers.

You will want to replace CMD with the actual task name eg `task-start-run`.

**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| answers | <code>Object</code> | object |

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
  lando.cache.remove(app.name + ':last_build');
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
