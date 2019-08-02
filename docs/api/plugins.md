<a name="lando.plugins.find"></a>

## lando.plugins.find(dirs, disablePlugins) ⇒ <code>Array</code>
Finds plugins

**Kind**: global function  
**Returns**: <code>Array</code> - Array of plugin metadata  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| dirs | <code>Array</code> |  | Directories to scan for plugins |
| disablePlugins | <code>Object</code> | <code>[]</code> | Array of plugin names to not load |

<a name="lando.plugins.load"></a>

## lando.plugins.load(plugin, [file]) ⇒ <code>Object</code>
Loads a plugin.

**Kind**: global function  
**Returns**: <code>Object</code> - Data about our plugin.  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| plugin | <code>String</code> |  | The name of the plugin |
| [file] | <code>String</code> | <code>plugin.path</code> | That path to the plugin |
| [...injected] | <code>Object</code> |  | Something to inject into the plugin |

