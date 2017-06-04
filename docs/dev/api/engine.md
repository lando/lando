<a name="module_engine"></a>

## engine
Contains methods and events related to running docker things.

**Emits**: <code>event:pre-bootstrap</code>  
**Since**: 3.0.0  
**Example**  
```js
// Start the docker engine
return lando.engine.up();

// List all lando containers
return lando.engine.list(data);

// Run a command(s) on a container(s)
return lando.engine.run(data);

// Inspect the details of a container
return lando.engine.inspect(data);

// Destroys a container(s)
return lando.engine.destroy(data);
```

* [engine](#module_engine)
    * [.up()](#module_engine.up) ⇒ <code>Promise</code>
    * [.isUp()](#module_engine.isUp) ⇒ <code>Promise</code>
    * [.down()](#module_engine.down) ⇒ <code>Promise</code>
    * [.isRunning(data)](#module_engine.isRunning) ⇒ <code>Promise</code>
    * [.list([data])](#module_engine.list) ⇒ <code>Promise</code>
    * [.exists(data)](#module_engine.exists) ⇒ <code>Promise</code>
    * [.inspect(data)](#module_engine.inspect) ⇒ <code>Promise</code>
    * [.start(data)](#module_engine.start) ⇒ <code>Promise</code>
    * [.run()](#module_engine.run)
    * [.stop()](#module_engine.stop)
    * [.destroy()](#module_engine.destroy)
    * [.build()](#module_engine.build)
    * ["event:pre-engine-up"](#module_engine.event_pre-engine-up)
    * ["event:post-engine-up"](#module_engine.event_post-engine-up)
    * ["event:pre-engine-down"](#module_engine.event_pre-engine-down)
    * ["event:post-engine-down"](#module_engine.event_post-engine-down)
    * ["event:pre-engine-start"](#module_engine.event_pre-engine-start)
    * ["event:post-engine-start"](#module_engine.event_post-engine-start)
    * ["event:pre-engine-run"](#module_engine.event_pre-engine-run)
    * ["event:post-engine-run"](#module_engine.event_post-engine-run)
    * ["event:pre-engine-stop"](#module_engine.event_pre-engine-stop)
    * ["event:post-engine-stop"](#module_engine.event_post-engine-stop)
    * ["event:pre-engine-destroy"](#module_engine.event_pre-engine-destroy)
    * ["event:post-engine-destroy"](#module_engine.event_post-engine-destroy)
    * ["event:pre-engine-build"](#module_engine.event_pre-engine-build)
    * ["event:post-engine-build"](#module_engine.event_post-engine-build)

<a name="module_engine.up"></a>

### engine.up() ⇒ <code>Promise</code>
Tries to activate the docker engine/daemon.

Generally the engine will be up and active, but if it isn't for whatever reason
Lando will try to start it.

NOTE: Most commands that require the docker engine to be up will automatically
call this anyway.

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-engine-up</code>, <code>event:post-engine-up</code>  
**Since**: 3.0.0  
**Todo**

- [ ] Does this need to be publically exposed still?

**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="module_engine.isUp"></a>

### engine.isUp() ⇒ <code>Promise</code>
Determines whether the docker engine is up or not.

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise with a boolean containing the engine up status.  
**Since**: 3.0.0  
**Todo**

- [ ] Does this need to be publically exposed still?

**Example**  
```js
// Start the engine if it is not up
return lando.engine.isUp()

// Check if we need to start
.then(function(isUp) {
  if (!isUp) {
    return lando.engine.up();
  }
});
```
<a name="module_engine.down"></a>

### engine.down() ⇒ <code>Promise</code>
Tries to deactivate the docker engine/daemon.

NOTE: Most commands that require the docker engine to be up will automatically
call this anyway.

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-engine-down</code>, <code>event:post-engine-down</code>  
**Since**: 3.0.0  
**Todo**

- [ ] Does this need to be publically exposed still?

<a name="module_engine.isRunning"></a>

### engine.isRunning(data) ⇒ <code>Promise</code>
Determines whether a container is running or not

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise with a boolean of whether the container is running or not  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | An ID that docker can recognize such as the container id or name. |

**Example**  
```js
// Check to see if our app's web service is running
return lando.engine.isRunning('myapp_web_1')

// Log the running status of the container
.then(isRunning) {
  lando.log.info('Container %s is running: %s', 'myapp_web_1', isRunning);
});
```
<a name="module_engine.list"></a>

### engine.list([data]) ⇒ <code>Promise</code>
Lists all the Lando containers. Optionally filter by app name.

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise with an Array of container Objects.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [data] | <code>String</code> | An appname to filter the containers by. |

**Example**  
```js
// List all the lando containers
return lando.engine.list()

// Log each container
.each(function(container) {
  lando.log.info(container);
});
```
<a name="module_engine.exists"></a>

### engine.exists(data) ⇒ <code>Promise</code>
Checks whether a specific service exists or not.

There are two ways to check whether a container exists:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise with a Boolean of whether the service exists or not.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Search criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> | An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> | An Array of paths to Docker compose files |
| data.project | <code>String</code> | A String of the project name (Usually this is the same as the app name) |
| data.opts | <code>Object</code> | Options on what service to check |
| data.opts.services | <code>Array</code> | An Array of services to check |

**Example**  
```js
// Check whether a service exists by container id
return lando.engine.exists({name: 'myapp_web_1'})

// Log whether it exists
.then(function(exists) {
  lando.log.info('Container exists: %s', exists);
});

// Check whether a service exists by compose/app object
// Assume we have an `app` object called `app` already.

// Add the services options
var compose = app;
compose.opts = {
  services: ['web']
};

// Check existence
return lando.engine.exists(compose);
```
<a name="module_engine.inspect"></a>

### engine.inspect(data) ⇒ <code>Promise</code>
Returns comprehensive service metadata. This is a wrapper around `docker inspect`.

There are two ways to get container metadata:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise with an Object of service metadata.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Search criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> | An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> | An Array of paths to Docker compose files |
| data.project | <code>String</code> | A String of the project name (Usually this is the same as the app name) |
| data.opts | <code>Object</code> | Options on what service to inspect |
| data.opts.services | <code>Array</code> | An Array of services to inspect. |

**Example**  
```js
// Log inspect data using an id
return lando.engine.inspect({id: '146d321f212d'})
.then(function(data) {
  lando.log.info('Container data is %j', data);
});

// Log service data by compose/app object
// Assume we have an `app` object called `app` already.

// Add the services options
var compose = app;
compose.opts = {
  services: ['web']
};

// Inspect the service
return lando.engine.inspect(compose);
```
<a name="module_engine.start"></a>

### engine.start(data) ⇒ <code>Promise</code>
Starts the containers for an app.

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise.  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | An `app` Object or an Array of `app` Objects if you want to start more than one app. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to start the app's containers. |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | The services to start. |
| [data.opts.background] | <code>Boolean</code> | <code>true</code> | Start the services in the background. |
| [data.opts.recreate] | <code>Boolean</code> | <code>false</code> | Recreate the services. |
| [data.opts.removeOrphans] | <code>Boolean</code> | <code>true</code> | Remove orphaned containers. |

**Example**  
```js
// Start up all the containers for given app object `app`
return lando.engine.start(app);

// Start and recreate specific services for an `app`
app.opts = {
  recreate: true,
  services: ['web', 'database']
};

return lando.engine.start(app);
```
<a name="module_engine.run"></a>

### engine.run()
Lists all the Lando apps

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="module_engine.stop"></a>

### engine.stop()
Lists all the Lando apps

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="module_engine.destroy"></a>

### engine.destroy()
Lists all the Lando apps

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="module_engine.build"></a>

### engine.build()
Lists all the Lando apps

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Example**  
```js
// List all the apps
return lando.app.list()

// Map each app to a summary and print results
.map(function(app) {
 return appSummary(app)
  .then(function(summary) {
   console.log(JSON.stringify(summary, null, 2));
 });
});
```
<a name="module_engine.event_pre-engine-up"></a>

### "event:pre-engine-up"
Event that allows you to do some things before the docker engine is booted
up.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-up"></a>

### "event:post-engine-up"
Event that allows you to do some things after the docker engine is booted
up.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_pre-engine-down"></a>

### "event:pre-engine-down"
Event that allows you to do some things after the docker engine is booted
up.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-down"></a>

### "event:post-engine-down"
Event that allows you to do some things after the docker engine is booted
up.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_pre-engine-start"></a>

### "event:pre-engine-start"
Event that allows you to do some things before an app's containers are
started

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-start"></a>

### "event:post-engine-start"
Event that allows you to do some things before an app's containers are
started

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_pre-engine-run"></a>

### "event:pre-engine-run"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<a name="module_engine.event_post-engine-run"></a>

### "event:post-engine-run"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<a name="module_engine.event_pre-engine-stop"></a>

### "event:pre-engine-stop"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<a name="module_engine.event_post-engine-stop"></a>

### "event:post-engine-stop"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<a name="module_engine.event_pre-engine-destroy"></a>

### "event:pre-engine-destroy"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<a name="module_engine.event_post-engine-destroy"></a>

### "event:post-engine-destroy"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<a name="module_engine.event_pre-engine-build"></a>

### "event:pre-engine-build"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
<a name="module_engine.event_post-engine-build"></a>

### "event:post-engine-build"
Event that allows altering of the config before it is used to
instantiate an app object.

Note that this is a global event so it is invoked with `lando.events.on`
not `app.events.on` See example below:

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The config from the app's .lando.yml |

**Example**  
```js
// Add in some extra default config to our app, set it to run first
lando.events.on('pre-instantiate-app', 1, function(config) {

  // Add a process env object, this is to inject ENV into the process
  // running the app task so we cna use $ENVARS in our docker compose
  // files
  config.dialedToInfinity = true;

});
```
