<a name="module_shell"></a>

## shell
Contains functions to exec commands.

**Since**: 3.0.0  
**Example**  
```js
// Run a docker compose command
return lando.shell.sh([COMPOSE_EXECUTABLE].concat(cmd), opts);

// Determine the location of the 'docker' command
var which = lando.shell.which(DOCKER_EXECUTABLE);

// Escape spaces in a command before it is exece
var cmd = lando.shell.escSpaces(opts.entrypoint.join(' '));

// Escape a command to make it more cli friendly before it is exece
var cmd = lando.shell.esc(cmd);
```

* [shell](#module_shell)
    * [~esc](#module_shell..esc) ⇒ <code>String</code>
    * [~which](#module_shell..which) ⇒ <code>String</code> \| <code>undefined</code>
    * [~sh(cmd, [opts])](#module_shell..sh) ⇒ <code>Promise</code>
    * [~escSpaces(s)](#module_shell..escSpaces) ⇒ <code>String</code>

<a name="module_shell..esc"></a>

### shell~esc ⇒ <code>String</code>
Escapes special characters in a command to make it more exec friendly.

**Kind**: inner method of [<code>shell</code>](#module_shell)  
**Returns**: <code>String</code> - The escaped cmd.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>Array</code> | A command as elements of an Array or a String. |

**Example**  
```js
// Escape the cmd
var escapedCmd = lando.shell.esc(['git', 'commit', '-m', 'my message']);
```
<a name="module_shell..which"></a>

### shell~which ⇒ <code>String</code> \| <code>undefined</code>
Returns the path of a specific command or binary.

**Kind**: inner method of [<code>shell</code>](#module_shell)  
**Returns**: <code>String</code> \| <code>undefined</code> - The path to the command or `undefined`.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>String</code> | A command to search for. |

**Example**  
```js
// Determine the location of the 'docker' command
var which = lando.shell.which(DOCKER_EXECUTABLE);
```
<a name="module_shell..sh"></a>

### shell~sh(cmd, [opts]) ⇒ <code>Promise</code>
Runs a command.

This is an abstraction method that:

 1. Delegates to either node's native `spawn` or `exec` methods.
 2. Promisifies the calling of these function
 3. Handles `stdout`, `stdin` and `stderr`

Beyond the options specified below you should be able to pass in known [exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
or [spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) options depending on whether we have a mode or not.

**Kind**: inner method of [<code>shell</code>](#module_shell)  
**Returns**: <code>Promise</code> - A promise with collected results if applicable.  
**See**

- [extra exec options](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
- [extra spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>Array</code> | The command to run as elements in an array or a string. |
| [opts] | <code>Object</code> | Options to help determine how the exec is run. |
| [opts.mode] | <code>String</code> | The mode, typically `collect` or `attach`; |
| [opts.detached] | <code>Boolean</code> | Whether we are running in detached mode or not |

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
<a name="module_shell..escSpaces"></a>

### shell~escSpaces(s) ⇒ <code>String</code>
Escapes any spaces in a command.

**Kind**: inner method of [<code>shell</code>](#module_shell)  
**Returns**: <code>String</code> - The space escaped cmd.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>Array</code> | A command as elements of an Array or a String. |

**Example**  
```js
// Escape the spaces in the cmd
var escapedCmd = lando.shell.escSpaces(['git', 'commit', '-m', 'my message']);
```
