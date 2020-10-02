<a name="lando.log.debug"></a>

## lando.log.debug(msg, [...values])
Logs a debug message.

Debug messages are intended to communicate lifecycle milestones and events that are relevant to developers

**Kind**: global function  
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
<a name="lando.log.error"></a>

## lando.log.error(msg, [...values])
Logs an error message.

Errors are intended to communicate there is a serious problem with the application

**Kind**: global function  
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
<a name="lando.log.info"></a>

## lando.log.info(msg, [...values])
Logs an info message.

Info messages are intended to communicate lifecycle milestones and events that are relevant to users

**Kind**: global function  
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
<a name="lando.log.silly"></a>

## lando.log.silly(msg, [...values])
Logs a silly message.

Silly messages are meant for hardcore debugging

**Kind**: global function  
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
<a name="lando.log.verbose"></a>

## lando.log.verbose(msg, [...values])
Logs a verbose message.

Verbose messages are intended to communicate extra information to the user and basics to a developer. They sit somewhere
inbetween info and debug

**Kind**: global function  
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
<a name="lando.log.warn"></a>

## lando.log.warn(msg, [...values])
Logs a warning message.

Warnings are intended to communicate you _might_ have a problem.

**Kind**: global function  
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
