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
    * [.run(data)](#module_engine.run) ⇒ <code>Promise</code>
    * [.stop(data)](#module_engine.stop) ⇒ <code>Promise</code>
    * [.destroy(data)](#module_engine.destroy) ⇒ <code>Promise</code>
    * [.build(data)](#module_engine.build) ⇒ <code>Promise</code>
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
Starts the containers/services for the specified `compose` object.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-engine-start</code>, <code>event:post-engine-start</code>  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A `compose` Object or an Array of `compose` Objects if you want to start more than one set of services. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to start the `compose` Objects containers. |
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

### engine.run(data) ⇒ <code>Promise</code>
Runs a command on a given service/container. This is a wrapper around `docker exec`.

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise with a string containing the command's output.  
**Emits**: <code>event:pre-engine-run</code>, <code>event:post-engine-run</code>  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A run Object or an Array of run Objects if you want to run more tha one command. |
| data.id | <code>String</code> |  | The container to run the command on. Must be an id that docker can recognize such as a container hash or name. |
| data.cmd | <code>String</code> |  | A String of a command or an Array whose elements are the parts of the command. |
| [data.opts] | <code>Object</code> |  | Options on how to run the command. |
| [data.opts.mode] | <code>String</code> | <code>&#x27;collect&#x27;</code> | Either `collect` or `attach`. Attach will connect to the run `stdin`. |
| [data.opts.pre] | <code>String</code> |  | A String or Array of additional arguments or options to append to the `cmd` before the user specified args and options are added. |
| [data.opts.attachStdin] | <code>Boolean</code> | <code>false</code> | Attach to the run's `stdin`. Helpful if you think there will be interactive options or prompts. |
| [data.opts.attachStdout] | <code>Boolean</code> | <code>true</code> | Attach to the run's `stdout`. Helpful to determine what the command is doing. |
| [data.opts.attachStderr] | <code>Boolean</code> | <code>true</code> | Attach to the run's `stderr`. Helpful to determine any errors. |
| [data.opts.env] | <code>Array</code> | <code>[]</code> | Additional environmental variables to set for the cmd. Must be in the form `KEY=VALUE`. |
| [data.opts.detachKeys] | <code>String</code> | <code>&#x27;ctrl-p,ctrl-q&#x27;</code> | Keystrokes that will detach the process. |
| [data.opts.tty] | <code>Boolean</code> | <code>true</code> | Allocate a pseudo `tty`. |
| [data.opts.user] | <code>String</code> | <code>&#x27;root&#x27;</code> | The user to run the command as. Can also be `user:group` or `uid` or `uid:gid`. |

**Example**  
```js
// Run composer install on the appserver container for an app called myapp
return lando.engine.run({id: 'myapp_appserver_1', cmd: ['composer', 'install']});

// Drop into an interactive bash shell on the database continer for an app called myapp
var bashRun = {
  id: 'myapp_database_1',
  cmd: ['bash'],
  opts: {
    mode: 'attach'
  }
};

return lando.engine.run(bashRun);
```
<a name="module_engine.stop"></a>

### engine.stop(data) ⇒ <code>Promise</code>
Stops containers for a `compose` object or a particular container.

There are two ways to stop containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-engine-stop</code>, <code>event:post-engine-stop</code>  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Stop criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> |  | An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on what services to setop |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | An Array of services to stop. |

**Example**  
```js
// Stop a specific container by id
return lando.engine.stop({name: 'myapp_service_1'})
.then(function() {
  lando.log.info('Container has stopped.');
});

// Assume we have an `app` object called `app` already.

// Stop all the containers for a particular app.
return lando.engine.stop(app);

// Stop a certain subset of an app's services.
app.opts = {
  services: ['index', 'appserver', 'db', 'db2']
};
return lando.engine.stop(app);
```
<a name="module_engine.destroy"></a>

### engine.destroy(data) ⇒ <code>Promise</code>
Removes containers for a `compose` object or a particular container.

There are two ways to remove containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-engine-destroy</code>, <code>event:post-engine-destroy</code>  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Remove criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> |  | An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on what services to remove. |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | An Array of services to remove. |
| [data.opts.volumes] | <code>Boolean</code> | <code>true</code> | Also remove volumes associated with the container(s). |
| [data.opts.force] | <code>Boolean</code> | <code>false</code> | Force remove the containers. |
| [data.opts.purge] | <code>Boolean</code> | <code>false</code> | Implies `volumes` and `force`. |

**Example**  
```js
// Remove a specific container by id
return lando.engine.destroy({name: 'myapp_service_1'})
.then(function() {
  lando.log.info('Container has been destroyed.');
});

// Assume we have an `app` object called `app` already.

// Destroy all the containers for a particular app.
return lando.engine.destroy(app);

// Force remove a certain subset of an app's services and their volumes
app.opts = {
  services: ['index', 'appserver', 'db', 'db2'],
  v: true,
  force: true
};
return lando.engine.destroy(app);
```
<a name="module_engine.build"></a>

### engine.build(data) ⇒ <code>Promise</code>
Tries to pull the services for a `compose` object, and then tries to build them if they are found
locally. This is a wrapper around `docker pull` and `docker build`.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Kind**: static method of [<code>engine</code>](#module_engine)  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: <code>event:pre-engine-build</code>, <code>event:post-engine-build</code>  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A `compose` Object or an Array of `compose` Objects if you want to build more than one set of services. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to build the `compose` objects containers. |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | The services to build. |
| [data.opts.nocache] | <code>Boolean</code> | <code>true</code> | Ignore the build cache. |
| [data.opts.pull] | <code>Boolean</code> | <code>true</code> | Try to pull first. |

**Example**  
```js
// Build the containers for an `app` object
return lando.engine.build(app);
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
Event that allows you to do some things before a `compose` Objects containers are
started

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-start"></a>

### "event:post-engine-start"
Event that allows you to do some things after a `compose` Objects containers are
started

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_pre-engine-run"></a>

### "event:pre-engine-run"
Event that allows you to do some things before a command is run on a particular
container.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-run"></a>

### "event:post-engine-run"
Event that allows you to do some things after a command is run on a particular
container.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_pre-engine-stop"></a>

### "event:pre-engine-stop"
Event that allows you to do some things before some containers are stopped.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-stop"></a>

### "event:post-engine-stop"
Event that allows you to do some things after some containers are stopped.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_pre-engine-destroy"></a>

### "event:pre-engine-destroy"
Event that allows you to do some things before some containers are destroyed.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-destroy"></a>

### "event:post-engine-destroy"
Event that allows you to do some things after some containers are destroyed.

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_pre-engine-build"></a>

### "event:pre-engine-build"
Event that allows you to do some things before a `compose` Objects containers are
started

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
<a name="module_engine.event_post-engine-build"></a>

### "event:post-engine-build"
Event that allows you to do some things before a `compose` Objects containers are
started

**Kind**: event emitted by [<code>engine</code>](#module_engine)  
**Since**: 3.0.0  
