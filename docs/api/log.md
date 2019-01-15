<a id="landologdebug"></a>

<h2 id="landologdebug" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.debug(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a debug message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a debug message
lando.log.debug('All details about docker inspect %j', massiveObject);
```
<div class="api-body-footer"></div>
<a id="landologerror"></a>

<h2 id="landologerror" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.error(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs an error message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log an error message
lando.log.error('This is an err with details %s', err);
```
<div class="api-body-footer"></div>
<a id="landologinfo"></a>

<h2 id="landologinfo" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.info(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs an info message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log an info message
lando.log.info('It is happening!');
```
<div class="api-body-footer"></div>
<a id="landologsilly"></a>

<h2 id="landologsilly" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.silly(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a silly message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a silly message
lando.log.silly('All details about all the things', unreasonablySizedObject);

// Log a silly message
lando.log.silly('If you are seeing this you have delved too greedily and too deep and likely have awoken something.');
```
<div class="api-body-footer"></div>
<a id="landologverbose"></a>

<h2 id="landologverbose" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.verbose(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a verbose message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a verbose message
lando.log.verbose('Config file %j loaded from %d', config, directory);
```
<div class="api-body-footer"></div>
<a id="landologwarn"></a>

<h2 id="landologwarn" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.log.warn(msg, [...values])</h2>
<div class="api-body-header"></div>

Logs a warning message.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log a warning message
lando.log.warning('Something is up with app %s in directory %s', appName, dir);
```
<div class="api-body-footer"></div>
