<a id="landopluginsfind"></a>

<h2 id="landopluginsfind" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.plugins.find(dirs, disablePlugins) ⇒ <code>Array</code></h2>
<div class="api-body-header"></div>

Finds plugins

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| dirs | <code>Array</code> |  | Directories to scan for plugins |
| disablePlugins | <code>Object</code> | <code>[]</code> | Array of plugin names to not load |

**Returns**: <code>Array</code> - Array of plugin metadata  
<div class="api-body-footer"></div>
<a id="landopluginsload"></a>

<h2 id="landopluginsload" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.plugins.load(plugin, [file]) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Loads a plugin.

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| plugin | <code>String</code> |  | The name of the plugin |
| [file] | <code>String</code> | <code>plugin.path</code> | That path to the plugin |
| [...injected] | <code>Object</code> |  | Something to inject into the plugin |

**Returns**: <code>Object</code> - Data about our plugin.  
<div class="api-body-footer"></div>
