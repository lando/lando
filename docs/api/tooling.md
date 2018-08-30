<a id="event_pre_command"></a>

<h2 id="event_pre_command" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_COMMAND"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a tooling command is run

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_command"></a>

<h2 id="event_post_command" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_COMMAND"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after a tooling command is run

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landotoolingbuild"></a>

<h2 id="landotoolingbuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.tooling.build(config) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

The tooling command builder

**Emits**: [<code>pre_COMMAND</code>](#event_pre_COMMAND), [<code>post_COMMAND</code>](#event_post_COMMAND)  
**Todo:**: this definitely needs work!  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The build config |

**Returns**: <code>Object</code> - The build object  
<div class="api-body-footer"></div>
