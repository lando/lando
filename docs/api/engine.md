<a name="event_pre_engine_build"></a>

## lando.events:pre-engine-build()
Event that allows you to do some things before a `compose` object's containers are
built

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_post_engine_build"></a>

## lando.events:post-engine-build()
Event that allows you to do some things after a `compose` object's containers are
built

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_pre_engine_destroy"></a>

## lando.events:pre-engine-destroy()
Event that allows you to do some things before some containers are destroyed.

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_post_engine_destroy"></a>

## lando.events:post-engine-destroy()
Event that allows you to do some things after some containers are destroyed.

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_pre_engine_run"></a>

## lando.events:pre-engine-run()
Event that allows you to do some things before a command is run on a particular
container.

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_post_engine_run"></a>

## lando.events:post-engine-run()
Event that allows you to do some things after a command is run on a particular
container.

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_pre_engine_start"></a>

## lando.events:pre-engine-start()
Event that allows you to do some things before a `compose` Objects containers are
started

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_post_engine_start"></a>

## lando.events:post-engine-start()
Event that allows you to do some things after a `compose` Objects containers are
started

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_pre_engine_stop"></a>

## lando.events:pre-engine-stop()
Event that allows you to do some things before some containers are stopped.

**Kind**: global function  
**Since**: 3.0.0  
<a name="event_post_engine_stop"></a>

## lando.events:post-engine-stop()
Event that allows you to do some things after some containers are stopped.

**Kind**: global function  
**Since**: 3.0.0  
<a name="lando.engine.build"></a>

## lando.engine.build(data) ⇒ <code>Promise</code>
Tries to pull the services for a `compose` object, and then tries to build them if they are found
locally. This is a wrapper around `docker pull` and `docker build`.

**NOTE:** Generally an instantiated `App` instance is a valid `compose` object

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>lando.events:pre-engine-build</code>](#event_pre_engine_build), [<code>lando.events:post-engine-build</code>](#event_post_engine_build)  
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
return lando.engine.build(app);
```
<a name="lando.engine.createNetwork"></a>

## lando.engine.createNetwork(name) ⇒ <code>Promise</code>
Creates a Docker network

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise with inspect data.  
**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.35/#operation/NetworkCreate) for info on opts.  
**Since**: 3.0.0.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the networks |

**Example**  
```js
return lando.engine.createNetwork('mynetwork')
```
<a name="lando.engine.destroy"></a>

## lando.engine.destroy(data) ⇒ <code>Promise</code>
Removes containers for a `compose` object or a particular container.

There are two ways to remove containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `App` instance is a valid `compose` object

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>lando.events:pre-engine-destroy</code>](#event_pre_engine_destroy), [<code>lando.events:post-engine-destroy</code>](#event_post_engine_destroy)  
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
return lando.engine.destroy(app);
```
<a name="lando.engine.exists"></a>

## lando.engine.exists(data) ⇒ <code>Promise</code>
Checks whether a specific service exists or not.

There are two ways to check whether a container exists:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` instance is a valid `compose` object

**Kind**: global function  
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
return lando.engine.exists(compose);
```
<a name="lando.engine.getNetwork"></a>

## lando.engine.getNetwork(id) ⇒ <code>Object</code>
Gets a Docker network

**Kind**: global function  
**Returns**: <code>Object</code> - A Dockerode Network object .  
**Since**: 3.0.0.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the network |

**Example**  
```js
const network = lando.engine.getNetwork('mynetwork')
```
<a name="lando.engine.getNetworks"></a>

## lando.engine.getNetworks([opts]) ⇒ <code>Promise</code>
Gets the docker networks.

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise with an array of network objects.  
**See**: [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Options to pass into the docker networks call |
| [opts.filters] | <code>Object</code> | Filters options |

<a name="lando.engine.isRunning"></a>

## lando.engine.isRunning(data) ⇒ <code>Promise</code>
Determines whether a container is running or not

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise with a boolean of whether the container is running or not  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | An ID that docker can recognize such as the container id or name. |

**Example**  
```js
// Check to see if our app's web service is running
return lando.engine.isRunning('myapp_web_1').then(isRunning) {
  lando.log.info('Container %s is running: %s', 'myapp_web_1', isRunning);
});
```
<a name="lando.engine.list"></a>

## lando.engine.list([options]) ⇒ <code>Promise</code>
Lists all the Lando containers. Optionally filter by app name.

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise with an Array of container Objects.  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> |  | Options to filter the list. |
| [options.all] | <code>Boolean</code> | <code>false</code> | Show even stopped containers |
| [options.app] | <code>String</code> |  | Show containers for only a certain app |
| [options.filter] | <code>Array</code> |  | Filter by additional key=value pairs |

**Example**  
```js
return lando.engine.list().each(function(container) {
  lando.log.info(container);
});
```
<a name="lando.engine.logs"></a>

## lando.engine.logs(data) ⇒ <code>Promise</code>
Returns logs for a given `compose` object

**NOTE:** Generally an instantiated `app` instance is a valid `compose` object

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise.  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A `compose` Object or an Array of `compose` Objects if you want to get logs for more than one set of services. |
| data.compose | <code>Array</code> |  | An Array of paths to Docker compose files |
| data.project | <code>String</code> |  | A String of the project name (Usually this is the same as the app name) |
| [data.opts] | <code>Object</code> |  | Options on how to build the `compose` objects containers. |
| [data.opts.follow] | <code>Boolean</code> | <code>false</code> | Whether to follow the log. Works like `tail -f`. |
| [data.opts.timestamps] | <code>Boolean</code> | <code>true</code> | Show timestamps in log. |

**Example**  
```js
// Get logs for an app
return lando.engine.logs(app);
```
<a name="lando.engine.run"></a>

## lando.engine.run(data) ⇒ <code>Promise</code>
Runs a command on a given service/container. This is a wrapper around `docker exec`.

UNTIL the resolution of https://github.com/apocas/docker-modem/issues/83 data needs to also be or be an
array of compose objects for this to work correctly on Windows as well. See some of the other engine
documentation for what a compose object looks like.

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise with a string containing the command's output.  
**Emits**: [<code>lando.events:pre-engine-run</code>](#event_pre_engine_run), [<code>lando.events:post-engine-run</code>](#event_post_engine_run)  
**Since**: 3.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | A run Object or an Array of run Objects if you want to run more tha one command. |
| data.id | <code>String</code> |  | The container to run the command on. Must be an id that docker can recognize such as a container hash or name. |
| data.cmd | <code>String</code> |  | A String of a command or an Array whose elements are the parts of the command. |
| [data.opts] | <code>Object</code> |  | Options on how to run the command. |
| [data.opts.mode] | <code>String</code> | <code>&#x27;collect&#x27;</code> | Either `collect` or `attach`. Attach will connect to the run `stdin`. |
| [data.opts.pre] | <code>String</code> |  | A String or Array of additional arguments or options to append to the `cmd` before the user specified args and options are added. |
| [data.opts.env] | <code>Array</code> | <code>[]</code> | Additional environmental variables to set for the cmd. Must be in the form `KEY=VALUE`. |
| [data.opts.user] | <code>String</code> | <code>&#x27;root&#x27;</code> | The user to run the command as. Can also be `user:group` or `uid` or `uid:gid`. |
| [data.opts.detach] | <code>String</code> | <code>false</code> | Run the process in the background |
| [data.opts.autoRemove] | <code>String</code> | <code>false</code> | Automatically removes the container |

**Example**  
```js
// Run composer install on the appserver container for an app called myapp
return lando.engine.run({id: 'myapp_appserver_1', cmd: ['composer', 'install']});

// Drop into an interactive bash shell on the database continer for an app called myapp
return lando.engine.run({
  id: 'myapp_database_1',
  cmd: ['bash'],
  opts: {
    mode: 'attach'
  }
});
```
<a name="lando.engine.scan"></a>

## lando.engine.scan(data) ⇒ <code>Promise</code>
Returns comprehensive service metadata. This is a wrapper around `docker inspect`.

There are two ways to get container metadata:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` instance is a valid `compose` object

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise with an Object of service metadata.  
**Since**: 3.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Search criteria, Need eithers an ID or a service within a compose context |
| data.id | <code>String</code> | An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`. |
| data.compose | <code>Array</code> | An Array of paths to Docker compose files |
| data.project | <code>String</code> | A String of the project name (Usually this is the same as the app name) |
| data.opts | <code>Object</code> | Options on what service to scan |
| data.opts.services | <code>Array</code> | An Array of services to scan. |

**Example**  
```js
// Log scan data using an id
return lando.engine.scan({id: '146d321f212d'}).then(function(data) {
  lando.log.info('Container data is %j', data);
});
```
<a name="lando.engine.start"></a>

## lando.engine.start(data) ⇒ <code>Promise</code>
Starts the containers/services for the specified `compose` object.

**NOTE:** Generally an instantiated `app` instance is a valid `compose` object

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>lando.events:pre-engine-start</code>](#event_pre_engine_start), [<code>lando.events:post-engine-start</code>](#event_post_engine_start)  
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
return lando.engine.start(app);
```
<a name="lando.engine.stop"></a>

## lando.engine.stop(data) ⇒ <code>Promise</code>
Stops containers for a `compose` object or a particular container.

There are two ways to stop containers:

 1. Using an object with `{id: id}` where `id` is a docker recognizable id
 2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`

These are detailed more below.

**NOTE:** Generally an instantiated `app` instance is a valid `compose` object

**Kind**: global function  
**Returns**: <code>Promise</code> - A Promise.  
**Emits**: [<code>lando.events:pre-engine-stop</code>](#event_pre_engine_stop), [<code>lando.events:post-engine-stop</code>](#event_post_engine_stop)  
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
return lando.engine.stop(app);
```
