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
