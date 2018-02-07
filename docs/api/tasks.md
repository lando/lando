<a name="module_tasks"></a>

## tasks
Contains some helpers to add and manage Lando tasks.

Lando tasks are a high level abstraction that should contain the neded
information for both a GUI or CLI to present relevant UX to the user.

**Since**: 3.0.0  
**Example**  
```js
// Gets all the tasks that have been loaded
var task = lando.tasks.tasks;

// Load in two tasks during bootstrap
lando.events.on('post-bootstrap', 1, function(lando) {

  // Load a task stored in a task module
  lando.tasks.add('config', require('./tasks/config')(lando));

  // Load a task stored in an object called task
  lando.tasks.add('config', task);

});
```

* [tasks](#module_tasks)
    * [.tasks](#module_tasks.tasks)
    * [.add(name, task)](#module_tasks.add)

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
