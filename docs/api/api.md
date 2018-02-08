<br/><br/>

<a id="lando"></a>

<h2 id="lando" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando ⇒ <code>Object</code></h2>
Contains the main bootstrap function, which will:

  1. Instantiate the lando object.
  2. Emit bootstrap events
  3. Initialize plugins

You will want to use this to grab `lando` instead of using `require('lando')(config)`.
The intiialization config in the example below is not required but recommended. You can
pass in any additional properties to override subsequently set/default values.

Check out `./bin/lando.js` in this repository for an example of bootstraping
`lando` for usage in a CLI.

**Emits**: <code>event:pre-bootstrap</code>, <code>event:post-bootstrap</code>  
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
<br/><br/>

<a id="landoclilargv"></a>

<h2 id="landoclilargv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.largv</h2>
A singleton object that contains the Lando global options.

This means all the options passed in after the `--` flag.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var largv = lando.tasks.largv;
```
<br/><br/>

<a id="landocacheset"></a>

<h2 id="landocacheset" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.set(key, data, [opts])</h2>
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
<br/><br/>

<a id="landocacheget"></a>

<h2 id="landocacheget" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.get(key) ⇒ <code>Any</code></h2>
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
<br/><br/>

<a id="landocacheremove"></a>

<h2 id="landocacheremove" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cache.remove(key)</h2>
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
<br/><br/>

<a id="landocliargv"></a>

<h2 id="landocliargv" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.argv()</h2>
Returns the lando options

This means all the options passed in before the `--` flag.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var argv = lando.tasks.argv;
```
<br/><br/>

<a id="landocliparseglobals"></a>

<h2 id="landocliparseglobals" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.parseGlobals()</h2>
Helper function to parse global opts

**See**: https://github.com/lando/lando/issues/351  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
var largv = lando.tasks.parseGlobals();
```
<br/><br/>

<a id="landocliparsetoyargs"></a>

<h2 id="landocliparsetoyargs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.parseToYargs(task) ⇒ <code>Object</code></h2>
Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.

A lando task object is an abstraction on top of yargs that also contains some
metadata about how to interactively ask questions on both the CLI and GUI. While this
method is useful, any task added to Lando via `lando.tasks.add` will automatically
be parsed with this method.

The interactivity metadata is light wrapper around [inquirer](https://github.com/sboudrias/Inquirer.js)

**Todo:**: Injecting the events here seems not the way we want to go?  
**See**

- [yargs docs](http://yargs.js.org/docs/)
- [inquirer docs](https://github.com/sboudrias/Inquirer.js)

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| task | <code>Object</code> | A Lando task object (@see add for definition) |

**Returns**: <code>Object</code> - A yargs command object  
**Example**  
```js
// Add that task to the CLI
yargs.command(lando.tasks.parseToYargs(task));
```
<br/><br/>

<a id="landoclistartheader"></a>

<h2 id="landoclistartheader" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.startHeader() ⇒ <code>String</code></h2>
Returns a cheeky header that can be used after an app is started.

**Since**: 3.0.0  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.startHeader());
```
<br/><br/>

<a id="landocliinitheader"></a>

<h2 id="landocliinitheader" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.initHeader() ⇒ <code>String</code></h2>
Returns a cheeky header that can be used after an app is init.

**Since**: 3.0.0  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.initHeader());
```
<br/><br/>

<a id="landoclitunnelheader"></a>

<h2 id="landoclitunnelheader" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.tunnelHeader() ⇒ <code>String</code></h2>
Returns a cheeky header that can be used after an app is shared

**Since**: 3.0.0  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.tunnelHeader());
```
<br/><br/>

<a id="landocliupdatemessage"></a>

<h2 id="landocliupdatemessage" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.updateMessage(url) ⇒ <code>String</code></h2>
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
<br/><br/>

<a id="landoclitable"></a>

<h2 id="landoclitable" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.cli.Table([opts]) ⇒ <code>Object</code></h2>
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
<br/><br/>

<a id="landousergetuid"></a>

<h2 id="landousergetuid" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.user.getUid() ⇒ <code>String</code></h2>
Returns the id of the user.

Note that on Windows this value is more or less worthless.

**Since**: 3.0.0  
**Returns**: <code>String</code> - The user ID.  
**Example**  
```js
// Get the id of the user.
var userId = lando.user.getEngineUserId();
```
<br/><br/>

<a id="landousergetgid"></a>

<h2 id="landousergetgid" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.user.getGid() ⇒ <code>String</code></h2>
Returns the group id of the user.

Note that on Windows this value is more or less worthless.

**Since**: 3.0.0  
**Returns**: <code>String</code> - The group ID.  
**Example**  
```js
// Get the id of the user.
var groupId = lando.user.getEngineUserGid();
```
<br/><br/>

<a id="landoyamlload"></a>

<h2 id="landoyamlload" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.load(file) ⇒ <code>Object</code></h2>
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
<br/><br/>

<a id="landoyamldump"></a>

<h2 id="landoyamldump" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.yaml.dump(file, data) ⇒</h2>
Dumps an object to a YAML file

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | The path to the file to be loaded |
| data | <code>Object</code> | The object to dump |

**Returns**: - Flename  
