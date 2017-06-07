<a name="module_user"></a>

## user
Contains some helpers to get information about the user.

**Since**: 3.0.0  
**Example**  
```js
// Get the id of the user.
var userId = lando.user.getEngineUserId();

// Get the group id of the user.
var groupId = lando.user.getEngineUserGid();
```

* [user](#module_user)
    * [.getEngineUserId()](#module_user.getEngineUserId) ⇒ <code>String</code>
    * [.getEngineUserGid()](#module_user.getEngineUserGid) ⇒ <code>String</code>

<a name="module_user.getEngineUserId"></a>

### user.getEngineUserId() ⇒ <code>String</code>
Returns the id of the user.

Note that on Windows this value is more or less worthless.

**Kind**: static method of [<code>user</code>](#module_user)  
**Returns**: <code>String</code> - The user ID.  
**Since**: 3.0.0  
**Example**  
```js
// Get the id of the user.
var userId = lando.user.getEngineUserId();
```
<a name="module_user.getEngineUserGid"></a>

### user.getEngineUserGid() ⇒ <code>String</code>
Returns the group id of the user.

Note that on Windows this value is more or less worthless.

**Kind**: static method of [<code>user</code>](#module_user)  
**Returns**: <code>String</code> - The group ID.  
**Since**: 3.0.0  
**Example**  
```js
// Get the id of the user.
var groupId = lando.user.getEngineUserGid();
```
