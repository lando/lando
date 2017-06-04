<a name="module_plugins"></a>

## plugins
Contains functions to help find and load plugins.

**Since**: 3.0.0  
**Example**  
```js
// Get the plugins from the global config and try to load them
return lando.config.plugins

// Load each plugin
.map(function(plugin) {
  return lando.plugins.load(plugin);
});
```
<a name="module_plugins.load"></a>

### plugins.load(plugin, [dirs]) ⇒ <code>Promise</code>
Loads a plugin.

See below for the default directories that are scanned. For each directory
scanned plugins can live in either the `plugins` or `node_modules`
subdirectories

**Kind**: static method of [<code>plugins</code>](#module_plugins)  
**Returns**: <code>Promise</code> - A Promise.  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| plugin | <code>String</code> |  | The name of the plugin |
| [dirs] | <code>Array</code> | <code>[config.srcRoot, config.sysConfRoot, config.userConfRoot]</code> | Additional directories to scan for the plugin. |

**Example**  
```js
// Load the plugin called 'shield-generator' and additionally scan `/tmp` for the plugin
return lando.plugins.load('shield-generator', ['/tmp']);
```
