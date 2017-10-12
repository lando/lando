<a name="module_tasks"></a>

## tasks
Contains some helpers to add and parse Lando tasks.

Lando tasks are a high level abstraction that should contain the neded
information for both a GUI or CLI to present relevant UX to the user.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
var task = lando.tasks.tasks;

// Gets all the global options that have been specified.
var largv = lando.tasks.largv;

// Load in two tasks during bootstrap
lando.events.on('post-bootstrap', 1, function(lando) {

  // Load a task stored in a task module
  lando.tasks.add('config', require('./tasks/config')(lando));

  // Load a task stored in an object called task
  lando.tasks.add('config', task);

});

// Add a task so it shows up as a command in the CLI
yargs.command(lando.tasks.parseToYargs(task));
```

* [tasks](#module_tasks)
    * [.tasks](#module_tasks.tasks)
    * [.largv](#module_tasks.largv)
    * [.parseGlobals()](#module_tasks.parseGlobals)
    * [.argv()](#module_tasks.argv)
    * [.parseToYargs(task)](#module_tasks.parseToYargs) ⇒ <code>Object</code>
    * [.add(name, task)](#module_tasks.add)
    * ["event:task-CMD-answers"](#module_tasks.event_task-CMD-answers)
    * ["event:task-CMD-run"](#module_tasks.event_task-CMD-run)

<a name="module_tasks.tasks"></a>

### tasks.tasks
A singleton array that contains all the tasks that have been added.

**Kind**: static property of [<code>tasks</code>](#module_tasks)  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
var task = lando.tasks.tasks;
```
<a name="module_tasks.largv"></a>

### tasks.largv
A singleton object that contains the Lando global options.

This means all the options passed in after the `--` flag.

**Kind**: static property of [<code>tasks</code>](#module_tasks)  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var largv = lando.tasks.largv;
```
<a name="module_tasks.parseGlobals"></a>

### tasks.parseGlobals()
Helper function to parse global opts

**Kind**: static method of [<code>tasks</code>](#module_tasks)  
**See**: https://github.com/lando/lando/issues/351  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
var largv = lando.tasks.parseGlobals();
```
<a name="module_tasks.argv"></a>

### tasks.argv()
Returns the lando options

This means all the options passed in before the `--` flag.

**Kind**: static method of [<code>tasks</code>](#module_tasks)  
**Since**: 3.0.0  
**Example**  
```js
// Gets all the global options that have been specified.
var argv = lando.tasks.argv;
```
<a name="module_tasks.parseToYargs"></a>

### tasks.parseToYargs(task) ⇒ <code>Object</code>
Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.

A lando task object is an abstraction on top of yargs that also contains some
metadata about how to interactively ask questions on both the CLI and GUI. While this
method is useful, any task added to Lando via `lando.tasks.add` will automatically
be parsed with this method.

The interactivity metadata is light wrapper around [inquirer](https://github.com/sboudrias/Inquirer.js)

**Kind**: static method of [<code>tasks</code>](#module_tasks)  
**Returns**: <code>Object</code> - A yargs command object  
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
<a name="module_tasks.add"></a>

### tasks.add(name, task)
Adds a Lando task to the global `lando.tasks.task` object.

A lando task object is an abstraction on top of [yargs](http://yargs.js.org/docs/)
and [inquirer](https://github.com/sboudrias/Inquirer.js) with a little extra special sauce.

**Kind**: static method of [<code>tasks</code>](#module_tasks)  
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
<a name="module_tasks.event_task-CMD-answers"></a>

### "event:task-CMD-answers"
Event that allows altering of argv or inquirer before interactive prompts
are run

**Kind**: event emitted by [<code>tasks</code>](#module_tasks)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| answers | <code>Object</code> | argv and inquirer questions |

<a name="module_tasks.event_task-CMD-run"></a>

### "event:task-CMD-run"
Event that allows final altering of answers

**Kind**: event emitted by [<code>tasks</code>](#module_tasks)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| answers | <code>Object</code> | object |

