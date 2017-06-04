<a name="module_node"></a>

## node
Contains helpful node modules that can be called directly from Lando.

These are useful so that plugins are not required to manage their own node
dependencies with a `package.json` file which can be annoying esp for small and lightweight
plugins.

**Since**: 3.0.0  
**Example**  
```js
// Get the lodash module
var _ = lando.node._;

// Get the restler module
var restler = lando.node.restler;
```

* [node](#module_node)
    * [._](#module_node._)
    * [.chalk](#module_node.chalk)
    * [.fs](#module_node.fs)
    * [.hasher](#module_node.hasher)
    * [.jsonfile](#module_node.jsonfile)
    * [.rest](#module_node.rest)
    * [.yaml](#module_node.yaml)

<a name="module_node._"></a>

### node._
Get lodash

**Kind**: static property of [<code>node</code>](#module_node)  
**Since**: 3.0.0  
**Example**  
```js
// Get the lodash module
var _ = lando.node._;
```
<a name="module_node.chalk"></a>

### node.chalk
Get chalk

**Kind**: static property of [<code>node</code>](#module_node)  
**Since**: 3.0.0  
**Example**  
```js
// Get the chalk module
var chalk = lando.node.chalk;
```
<a name="module_node.fs"></a>

### node.fs
Get fs-extra

**Kind**: static property of [<code>node</code>](#module_node)  
**Since**: 3.0.0  
**Example**  
```js
// Get the fs-extra module
var fs = lando.node.fs;
```
<a name="module_node.hasher"></a>

### node.hasher
Get object-hash

**Kind**: static property of [<code>node</code>](#module_node)  
**Since**: 3.0.0  
**Example**  
```js
// Get the object-hash module
var hasher = lando.node.hasher;
```
<a name="module_node.jsonfile"></a>

### node.jsonfile
Get jsonfile

**Kind**: static property of [<code>node</code>](#module_node)  
**Since**: 3.0.0  
**Example**  
```js
// Get the jsonfile module
var jsonfile = lando.node.jsonfile;
```
<a name="module_node.rest"></a>

### node.rest
Get restler

**Kind**: static property of [<code>node</code>](#module_node)  
**Since**: 3.0.0  
**Example**  
```js
// Get the restler module
var rest = lando.node.rest;
```
<a name="module_node.yaml"></a>

### node.yaml
Get js-yaml

**Kind**: static property of [<code>node</code>](#module_node)  
**Since**: 3.0.0  
**Example**  
```js
// Get the js-yaml module
var yaml = lando.node.yaml;
```
