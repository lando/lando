<a name="lando.shell.sh"></a>

## lando.shell.sh(cmd, [opts]) ⇒ <code>Promise</code>
Runs a command.

This is an abstraction method that:

 1. Delegates to either node's native `spawn` or `exec` methods.
 2. Promisifies the calling of these function
 3. Handles `stdout`, `stdin` and `stderr`

**Kind**: global function  
**Returns**: <code>Promise</code> - A promise with collected results if applicable.  
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
| [opts.cwd] | <code>Boolean</code> | <code>process.cwd()</code> | The directory to run the command from |

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
<a name="lando.shell.which"></a>

## lando.shell.which(cmd) ⇒ <code>String</code> \| <code>null</code>
Returns the path of a specific command or binary.

**Kind**: global function  
**Returns**: <code>String</code> \| <code>null</code> - The path to the command or null.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>String</code> | A command to search for. |

**Example**  
```js
// Determine the location of the 'docker' command
const which = lando.shell.which(DOCKER_EXECUTABLE);
```
