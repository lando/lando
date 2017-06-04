<a name="module_cli"></a>

## cli
Contains methods to help initialize and display the CLI

**Since**: 3.0.0  
**Example**  
```js
// Initialize CLI
return lando.cli.init(lando);
```

* [cli](#module_cli)
    * [.startHeader()](#module_cli.startHeader) ⇒ <code>String</code>
    * [.Table([opts])](#module_cli.Table) ⇒ <code>Object</code>
    * [.init(lando)](#module_cli.init)
    * ["event:pre-cli-load"](#module_cli.event_pre-cli-load)

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
<a name="module_cli.init"></a>

### cli.init(lando)
Initializes the CLI.

This will either print the CLI usage to the console or route the command and
options given by the user to the correct place.

**Kind**: static method of [<code>cli</code>](#module_cli)  
**Emits**: <code>event:pre-cli-load</code>  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| lando | <code>Object</code> | An initialized lando object. |

**Example**  
```js
// Initialize the CLI
return lando.cli.init(lando);
```
<a name="module_cli.event_pre-cli-load"></a>

### "event:pre-cli-load"
Event that allows other things to alter the tasks being loaded to the CLI.

**Kind**: event emitted by [<code>cli</code>](#module_cli)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| tasks | <code>Object</code> | An object of Lando tasks |

**Example**  
```js
// As a joke remove all tasks and give us a blank CLI
lando.events.on('pre-cli-load', function(tasks) {
  tasks = {};
});
```
