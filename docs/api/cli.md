<a name="module_cli"></a>

## cli
Contains some CLI artwork and helpers

**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var largv = lando.tasks.largv;

// Get the start header
return lando.cli.startHeader();

// Add a task so it shows up as a command in the CLI
yargs.command(lando.tasks.parseToYargs(task));
```

* [cli](#module_cli)
    * [.largv](#module_cli.largv)
    * [.argv()](#module_cli.argv)
    * [.parseGlobals()](#module_cli.parseGlobals)
    * [.parseToYargs(task)](#module_cli.parseToYargs) ⇒ <code>Object</code>
    * [.startHeader()](#module_cli.startHeader) ⇒ <code>String</code>
    * [.initHeader()](#module_cli.initHeader) ⇒ <code>String</code>
    * [.tunnelHeader()](#module_cli.tunnelHeader) ⇒ <code>String</code>
    * [.updateMessage(url)](#module_cli.updateMessage) ⇒ <code>String</code>
    * [.Table([opts])](#module_cli.Table) ⇒ <code>Object</code>

<a name="module_cli.largv"></a>

### cli.largv
A singleton object that contains the Lando global options.

This means all the options passed in after the `--` flag.

**Kind**: static property of [<code>cli</code>](#module_cli)  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var largv = lando.tasks.largv;
```
<a name="module_cli.argv"></a>

### cli.argv()
Returns the lando options

This means all the options passed in before the `--` flag.

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var argv = lando.tasks.argv;
```
<a name="module_cli.parseGlobals"></a>

### cli.parseGlobals()
Helper function to parse global opts

**Kind**: static method of [<code>cli</code>](#module_cli)  
**See**: https://github.com/lando/lando/issues/351  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
var largv = lando.tasks.parseGlobals();
```
<a name="module_cli.parseToYargs"></a>

### cli.parseToYargs(task) ⇒ <code>Object</code>
Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.

A lando task object is an abstraction on top of yargs that also contains some
metadata about how to interactively ask questions on both the CLI and GUI. While this
method is useful, any task added to Lando via `lando.tasks.add` will automatically
be parsed with this method.

The interactivity metadata is light wrapper around [inquirer](https://github.com/sboudrias/Inquirer.js)

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Returns**: <code>Object</code> - A yargs command object  
**Todo:**: Injecting the events here seems not the way we want to go?  
**See**

- [yargs docs](http://yargs.js.org/docs/)
- [inquirer docs](https://github.com/sboudrias/Inquirer.js)

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| task | <code>Object</code> | A Lando task object (@see add for definition) |

**Example**  
```js
// Add that task to the CLI
yargs.command(lando.tasks.parseToYargs(task));
```
<a name="module_cli.startHeader"></a>

### cli.startHeader() ⇒ <code>String</code>
Returns a cheeky header that can be used after an app is started.

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Since**: 3.0.0  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.startHeader());
```
<a name="module_cli.initHeader"></a>

### cli.initHeader() ⇒ <code>String</code>
Returns a cheeky header that can be used after an app is init.

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Since**: 3.0.0  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.initHeader());
```
<a name="module_cli.tunnelHeader"></a>

### cli.tunnelHeader() ⇒ <code>String</code>
Returns a cheeky header that can be used after an app is shared

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Returns**: <code>String</code> - A header string we can print to the CLI  
**Since**: 3.0.0  
**Example**  
```js
// Print the header to the console
console.log(lando.cli.tunnelHeader());
```
<a name="module_cli.updateMessage"></a>

### cli.updateMessage(url) ⇒ <code>String</code>
Returns a mesage indicating the availability of an update

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Returns**: <code>String</code> - An update message we can print to the CLI  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL with the link to the update |

**Example**  
```js
// Print the header to the console
console.log(lando.cli.tunnelHeader());
```
<a name="module_cli.Table"></a>

### cli.Table([opts]) ⇒ <code>Object</code>
Utility function to help construct CLI displayable tables

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Returns**: <code>Object</code> - Table metadata that can be printed with toString()  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> |  | Options for how the table should be built |
| [opts.arrayJoiner] | <code>String</code> | <code>&#x27;, &#x27;</code> | A delimiter to be used when joining array data |

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
