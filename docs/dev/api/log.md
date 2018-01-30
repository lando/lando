<a name="module_log"></a>

## log
Contains logging functions built from passed in config.

Logged entries are printed to the console and to `lando.log` and `error.log`
in specified directory. The verbosity of these logs is determined by the
lando global config or passed in global CLI option

**Since**: 3.0.0  
**Example**  
```js
// Log an error message
lando.log.error('This is an err with details %j', err);

// Log a silly message
lando.log.silly('This is probably too much logging!');

// Log an info message
lando.log.info('Loaded up the %s app', appName);
```

* [log](#module_log)
    * [.error](#module_log.error)
    * [.warn](#module_log.warn)
    * [.info](#module_log.info)
    * [.verbose](#module_log.verbose)
    * [.debug](#module_log.debug)
    * [.silly](#module_log.silly)

<a name="module_log.error"></a>

### log.error
Logs an error message.

**Kind**: static method of [<code>log</code>](#module_log)  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | A string that will be passed into nodes core `utils.format()` |
| [...values] | <code>Any</code> | Values to be passed `utils.format()` |

**Example**  
```js
// Log an error message
lando.log.error('This is an err with details %j', err);
```
<a name="module_log.warn"></a>

### log.warn
Logs a warning message.

**Kind**: static method of [<code>log</code>](#module_log)  
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
<a name="module_log.info"></a>

### log.info
Logs an info message.

**Kind**: static method of [<code>log</code>](#module_log)  
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
<a name="module_log.verbose"></a>

### log.verbose
Logs a verbose message.

**Kind**: static method of [<code>log</code>](#module_log)  
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
<a name="module_log.debug"></a>

### log.debug
Logs a debug message.

**Kind**: static method of [<code>log</code>](#module_log)  
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
<a name="module_log.silly"></a>

### log.silly
Logs a silly message.

**Kind**: static method of [<code>log</code>](#module_log)  
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
