<a id="event_pre_engine_build"></a>

<h2 id="event_pre_engine_build" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_build"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_build"></a>

<h2 id="event_post_engine_build" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_build"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_destroy"></a>

<h2 id="event_pre_engine_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_destroy"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before some containers are destroyed.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_destroy"></a>

<h2 id="event_post_engine_destroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_destroy"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after some containers are destroyed.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_run"></a>

<h2 id="event_pre_engine_run" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_run"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a command is run on a particular
container.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_run"></a>

<h2 id="event_post_engine_run" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_run"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after a command is run on a particular
container.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_start"></a>

<h2 id="event_pre_engine_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_start"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_start"></a>

<h2 id="event_post_engine_start" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_start"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after a `compose` Objects containers are
started

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_pre_engine_stop"></a>

<h2 id="event_pre_engine_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "pre_engine_stop"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things before some containers are stopped.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="event_post_engine_stop"></a>

<h2 id="event_post_engine_stop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  "post_engine_stop"</h2>
<div class="api-body-header"></div>

Event that allows you to do some things after some containers are stopped.

**Since**: 3.0.0  
<div class="api-body-footer"></div>
<a id="landoenginebuild"></a>

<h2 id="landoenginebuild" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.build(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Tries to pull the services for a `compose` object, and then tries to build them if they are found
locally. This is a wrapper around `docker pull` and `docker build`.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_build</code>](#event_pre_engine_build), [<code>post_engine_build</code>](#event_post_engine_build)  
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

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Build the containers for an `app` object
return lando.engine.build(app);
```
<div class="api-body-footer"></div>
<a id="landoenginecreatenetwork"></a>

<h2 id="landoenginecreatenetwork" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.createNetwork(name) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Creates a Docker network

**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.35/#operation/NetworkCreate) for info on opts.  
**Since**: 3.0.0.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the networks |

**Returns**: <code>Promise</code> - A Promise with inspect data.  
**Example**  
```js
// Create the network
 return ando.engine.createNetwork('mynetwork')
```
<div class="api-body-footer"></div>
<a id="landoenginedestroy"></a>

<h2 id="landoenginedestroy" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.destroy(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Removes containers for a `compose` object or a particular container.

There are two ways to remove containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_destroy</code>](#event_pre_engine_destroy), [<code>post_engine_destroy</code>](#event_post_engine_destroy)  
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

**Returns**: <code>Promise</code> - A Promise.  
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
<div class="api-body-footer"></div>
<a id="landoengineexists"></a>

<h2 id="landoengineexists" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.exists(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Checks whether a specific service exists or not.

There are two ways to check whether a container exists:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Search criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> | An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> | An Array of paths to Docker compose files |
| data.project | <code>String</code> | A String of the project name (Usually this is the same as the app name) |
| data.opts | <code>Object</code> | Options on what service to check |
| data.opts.services | <code>Array</code> | An Array of services to check |

**Returns**: <code>Promise</code> - A Promise with a Boolean of whether the service exists or not.  
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
<div class="api-body-footer"></div>
<a id="landoenginegetnetwork"></a>

<h2 id="landoenginegetnetwork" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.getNetwork(id) ⇒ <code>Object</code></h2>
<div class="api-body-header"></div>

Gets a Docker network

**Since**: 3.0.0.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the network |

**Returns**: <code>Object</code> - A Dockerode Network object .  
**Example**  
```js
// Get the network
 return lando.engine.getNetwork('mynetwork')
```
<div class="api-body-footer"></div>
<a id="landoenginegetnetworks"></a>

<h2 id="landoenginegetnetworks" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.getNetworks([opts]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Gets the docker networks.

**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Options to pass into the docker networks call |
| [opts.filters] | <code>Object</code> | Filters options |

**Returns**: <code>Promise</code> - A Promise with an array of network objects.  
**Example**  
```js
// Options to filter the networks
 var opts = {
   filters: {
     driver: {bridge: true},
     name: {_default: true}
   }
 };

 // Get the networks
 return lando.engine.getNetworks(opts)

 // Filter out lando_default
 .filter(function(network) {
   return network.Name !== 'lando_default';
 })

 // Map to list of network names
 .map(function(network) {
   return network.Name;
 });
```
<div class="api-body-footer"></div>
<a id="landoengineisrunning"></a>

<h2 id="landoengineisrunning" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.isRunning(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Determines whether a container is running or not

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | An ID that docker can recognize such as the container id or name. |

**Returns**: <code>Promise</code> - A Promise with a boolean of whether the container is running or not  
**Example**  
```js
// Check to see if our app's web service is running
return lando.engine.isRunning('myapp_web_1')

// Log the running status of the container
.then(isRunning) {
  lando.log.info('Container %s is running: %s', 'myapp_web_1', isRunning);
});
```
<div class="api-body-footer"></div>
<a id="landoenginelist"></a>

<h2 id="landoenginelist" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.list([data]) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Lists all the Lando containers. Optionally filter by app name.

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [data] | <code>String</code> | An appname to filter the containers by. |

**Returns**: <code>Promise</code> - A Promise with an Array of container Objects.  
**Example**  
```js
// List all the lando containers
return lando.engine.list()

// Log each container
.each(function(container) {
  lando.log.info(container);
});
```
<div class="api-body-footer"></div>
<a id="landoenginelogs"></a>

<h2 id="landoenginelogs" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.logs(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Returns logs for a given `compose` object

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A `compose` Object or an Array of `compose` Objects if you want to get logs for more than one set of services. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to build the `compose` objects containers. |
| [data.opts.follow] | <code>Boolean</code> | <code>false</code> | Whether to follow the log. Works like `tail -f`. |
| [data.opts.timestamps] | <code>Boolean</code> | <code>true</code> | Show timestamps in log. |

**Returns**: <code>Promise</code> - A Promise.  
**Example**  
```js
// Get logs for an app
return lando.engine.logs(app);
```
<div class="api-body-footer"></div>
<a id="landoenginerun"></a>

<h2 id="landoenginerun" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.run(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Runs a command on a given service/container. This is a wrapper around `docker exec`.

UNTIL the resolution of https://github.com/apocas/docker-modem/issues/83 data needs to also be or be an
array of compose objects for this to work correctly on Windows as well. See some of the other engine
documentation for what a compose object looks like.

**Emits**: [<code>pre_engine_run</code>](#event_pre_engine_run), [<code>post_engine_run</code>](#event_post_engine_run)  
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

**Returns**: <code>Promise</code> - A Promise with a string containing the command's output.  
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
<div class="api-body-footer"></div>
<a id="landoenginescan"></a>

<h2 id="landoenginescan" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.scan(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Returns comprehensive service metadata. This is a wrapper around `docker inspect`.

There are two ways to get container metadata:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Search criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> | An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> | An Array of paths to Docker compose files |
| data.project | <code>String</code> | A String of the project name (Usually this is the same as the app name) |
| data.opts | <code>Object</code> | Options on what service to scan |
| data.opts.services | <code>Array</code> | An Array of services to scan. |

**Returns**: <code>Promise</code> - A Promise with an Object of service metadata.  
**Example**  
```js
// Log scan data using an id
return lando.engine.scan({id: '146d321f212d'})
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

// scan the service
return lando.engine.scan(compose);
```
<div class="api-body-footer"></div>
<a id="landoenginestart"></a>

<h2 id="landoenginestart" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.start(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Starts the containers/services for the specified `compose` object.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_start</code>](#event_pre_engine_start), [<code>post_engine_start</code>](#event_post_engine_start)  
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

**Returns**: <code>Promise</code> - A Promise.  
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
<div class="api-body-footer"></div>
<a id="landoenginestop"></a>

<h2 id="landoenginestop" style="color: #ED3F7A; margin: 10px 0px; border-width: 2px 0px; padding: 25px 0px; border-color: #664b9d; border-style: solid;">
  lando.engine.stop(data) ⇒ <code>Promise</code></h2>
<div class="api-body-header"></div>

Stops containers for a `compose` object or a particular container.

There are two ways to stop containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` object is a valid `compose` object

**Emits**: [<code>pre_engine_stop</code>](#event_pre_engine_stop), [<code>post_engine_stop</code>](#event_post_engine_stop)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Stop criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> |  | An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on what services to setop |
| [data.opts.services] | <code>Array</code> | <code>&#x27;all services&#x27;</code> | An Array of services to stop. |

**Returns**: <code>Promise</code> - A Promise.  
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
<div class="api-body-footer"></div>
