<a name="module_error"></a>

## error
Helper functions to help with error handling.

**Since**: 3.0.0  

* [error](#module_error)
    * [.handleError(err)](#module_error.handleError) ⇒ <code>Array</code>
    * [.getStackTrace(err)](#module_error.getStackTrace) ⇒ <code>Object</code>

<a name="module_error.handleError"></a>

### error.handleError(err) ⇒ <code>Array</code>
Log error, report it and then exit the process with error code 1.

**Kind**: static method of [<code>error</code>](#module_error)  
**Returns**: <code>Array</code> - Returns the total.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Object</code> | The error |

<a name="module_error.getStackTrace"></a>

### error.getStackTrace(err) ⇒ <code>Object</code>
Helper function to extract a stack trace from an error object.

**Kind**: static method of [<code>error</code>](#module_error)  
**Returns**: <code>Object</code> - The stack trace object.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Object</code> | The error object |

