## Members

<dl>
<dt><a href="#app">app</a></dt>
<dd><p>Module for apps.</p>
</dd>
<dt><a href="#bootstrap">bootstrap</a></dt>
<dd><p>Lando initialization system.</p>
</dd>
<dt><a href="#cache">cache</a></dt>
<dd><p>Cache module.</p>
</dd>
<dt><a href="#cli">cli</a></dt>
<dd><p>CLI module.</p>
</dd>
<dt><a href="#compose">compose</a></dt>
<dd><p>Module to wrap and abstract access to docker compose.</p>
</dd>
<dt><a href="#config">config</a></dt>
<dd><p>Config module</p>
</dd>
<dt><a href="#container">container</a></dt>
<dd><p>Module to wrap and abstract access to dockerode.</p>
</dd>
<dt><a href="#daemon">daemon</a></dt>
<dd><p>Module to interact with docker daemon</p>
</dd>
<dt><a href="#docker">docker</a></dt>
<dd><p>Router to pass request to either docker engine or docker compose</p>
</dd>
<dt><a href="#engine">engine</a></dt>
<dd><p>Module for interfacing with docker</p>
</dd>
<dt><a href="#env">env</a></dt>
<dd><p>Env module.</p>
</dd>
<dt><a href="#getEnv">getEnv</a></dt>
<dd><p>Get config</p>
</dd>
<dt><a href="#error">error</a></dt>
<dd><p>Error module.</p>
</dd>
<dt><a href="#errorTags">errorTags</a></dt>
<dd><p>Small object for adding and getting error tags.</p>
</dd>
<dt><a href="#events">events</a></dt>
<dd><p>Asynchronous event engine module.</p>
</dd>
<dt><a href="#lando">lando</a></dt>
<dd><p>Get a fully initialized lando object</p>
</dd>
<dt><a href="#logger">logger</a></dt>
<dd><p>Logging module</p>
</dd>
<dt><a href="#metrics">metrics</a></dt>
<dd><p>Anonymous metrics reporting for Lando.</p>
</dd>
<dt><a href="#network">network</a></dt>
<dd><p>Module to wrap and abstract access to dockerode&#39;s network stuff.</p>
</dd>
<dt><a href="#lando">lando</a></dt>
<dd><p>Lando node helpers</p>
</dd>
<dt><a href="#plugins">plugins</a></dt>
<dd><p>Plugins module</p>
</dd>
<dt><a href="#promise">promise</a></dt>
<dd><p>Promises module</p>
</dd>
<dt><a href="#registry">registry</a></dt>
<dd><p>Handles app registration.</p>
</dd>
<dt><a href="#serializer">serializer</a></dt>
<dd><p>Class for abstracting serializing of promises within the process.</p>
</dd>
<dt><a href="#shell">shell</a></dt>
<dd><p>Shell module</p>
</dd>
<dt><a href="#esc">esc</a></dt>
<dd><p>Escapes an array or string into a string to make it more CLI friendly</p>
</dd>
<dt><a href="#which">which</a></dt>
<dd><p>Do a which</p>
</dd>
<dt><a href="#tasks">tasks</a></dt>
<dd><p>Tasks module.</p>
</dd>
<dt><a href="#tasks">tasks</a></dt>
<dd><p>Place to store global tasks</p>
</dd>
<dt><a href="#largv">largv</a></dt>
<dd><p>Get global lando verbose arg</p>
</dd>
<dt><a href="#user">user</a></dt>
<dd><p>User module</p>
</dd>
<dt><a href="#utils">utils</a></dt>
<dd><p>Utils module</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#list">list()</a></dt>
<dd><p>Lists all the users apps known to Lando.</p>
</dd>
<dt><a href="#get">get()</a></dt>
<dd><p>Get an app object</p>
</dd>
<dt><a href="#isRunning">isRunning()</a></dt>
<dd><p>Returns whether an app is running or not</p>
</dd>
<dt><a href="#exists">exists()</a></dt>
<dd><p>Returns true if app with given app name exists.</p>
</dd>
<dt><a href="#info">info()</a></dt>
<dd><p>Gets information about an app</p>
</dd>
<dt><a href="#uninstall">uninstall()</a></dt>
<dd><p>Uninstalls an app&#39;s components</p>
</dd>
<dt><a href="#cleanup">cleanup()</a></dt>
<dd><p>Attempts to clean up corrupted apps. internal will compare the appRegistry
with kbox.list to determine apps that may have orphaned containers. If
those apps do have orphaned containers then we remove those containers
and finally the corrupted app from the appRegisty.</p>
</dd>
<dt><a href="#start">start()</a></dt>
<dd><p>Starts an app&#39;s components.</p>
</dd>
<dt><a href="#stop">stop()</a></dt>
<dd><p>Stops an app&#39;s components</p>
</dd>
<dt><a href="#restart">restart()</a></dt>
<dd><p>Stops and then starts an app&#39;s components.</p>
</dd>
<dt><a href="#destroy">destroy()</a></dt>
<dd><p>Uninstalls an app&#39;s components including the data container, and removes
the app&#39;s code directory.</p>
</dd>
<dt><a href="#rebuild">rebuild()</a></dt>
<dd><p>Rebuilds an apps containers. this will stop an app&#39;s containers, remove all
of them except the data container, pull down the latest versions of the
containers as specified in the app&#39;s .lando.yml. You will need to run
<code>kbox start</code> when done to restart your app.</p>
</dd>
<dt><a href="#set">set()</a></dt>
<dd><p>Override set to add logging</p>
</dd>
<dt><a href="#get">get()</a></dt>
<dd><p>Override get to add logging</p>
</dd>
<dt><a href="#remove">remove()</a></dt>
<dd><p>Override del to add logging</p>
</dd>
<dt><a href="#Table">Table()</a></dt>
<dd><p>Create a new CLI table</p>
</dd>
<dt><a href="#init">init()</a></dt>
<dd><p>Initialize the CLI</p>
</dd>
<dt><a href="#list">list()</a></dt>
<dd><p>Query docker for a list of containers.</p>
</dd>
<dt><a href="#findContainer">findContainer()</a></dt>
<dd><p>Find a docker container.</p>
</dd>
<dt><a href="#inspect">inspect()</a></dt>
<dd><p>Inspect a container.</p>
</dd>
<dt><a href="#isRunning">isRunning()</a></dt>
<dd><p>Return true if the container is running otherwise false.</p>
</dd>
<dt><a href="#stop">stop()</a></dt>
<dd><p>Stop a container.</p>
</dd>
<dt><a href="#run">run()</a></dt>
<dd><p>Do a docker run</p>
</dd>
<dt><a href="#remove">remove()</a></dt>
<dd><p>Remove a container.</p>
</dd>
<dt><a href="#list">list()</a></dt>
<dd><p>Query docker for a list of containers.</p>
</dd>
<dt><a href="#inspect">inspect()</a></dt>
<dd><p>Inspect a container.</p>
</dd>
<dt><a href="#isRunning">isRunning()</a></dt>
<dd><p>Return true if the container is running otherwise false.</p>
</dd>
<dt><a href="#start">start()</a></dt>
<dd><p>Start container(s).</p>
</dd>
<dt><a href="#exists">exists()</a></dt>
<dd><p>Check if container exists</p>
</dd>
<dt><a href="#run">run()</a></dt>
<dd><p>Create and run a command inside of a container.</p>
</dd>
<dt><a href="#stop">stop()</a></dt>
<dd><p>Stop a container.</p>
</dd>
<dt><a href="#remove">remove()</a></dt>
<dd><p>Remove a container.</p>
</dd>
<dt><a href="#build">build()</a></dt>
<dd><p>Builds and/or pulls a docker image</p>
</dd>
<dt><a href="#up">up()</a></dt>
<dd><p>Turns the docker daemon on</p>
</dd>
<dt><a href="#isUp">isUp()</a></dt>
<dd><p>Returns the state of the docker daemon</p>
</dd>
<dt><a href="#down">down()</a></dt>
<dd><p>Shuts the docker daemon off.</p>
</dd>
<dt><a href="#isRunning">isRunning()</a></dt>
<dd><p>Tells you if a container is running.</p>
</dd>
<dt><a href="#list">list()</a></dt>
<dd><p>Lists installed containers.</p>
</dd>
<dt><a href="#exists">exists()</a></dt>
<dd><p>Returns whether a container exists or not.</p>
</dd>
<dt><a href="#inspect">inspect()</a></dt>
<dd><p>Inspects a container and returns details.</p>
</dd>
<dt><a href="#start">start()</a></dt>
<dd><p>Starts container(s)</p>
</dd>
<dt><a href="#run">run()</a></dt>
<dd><p>Runs a command in a container, in interactive mode</p>
</dd>
<dt><a href="#stop">stop()</a></dt>
<dd><p>Stops container(s).</p>
</dd>
<dt><a href="#destroy">destroy()</a></dt>
<dd><p>Removes a container from the engine.</p>
</dd>
<dt><a href="#build">build()</a></dt>
<dd><p>Pulls or builds images.</p>
</dd>
<dt><a href="#getHomeDir">getHomeDir()</a></dt>
<dd><p>Document</p>
</dd>
<dt><a href="#getUserConfRoot">getUserConfRoot()</a></dt>
<dd><p>Document</p>
</dd>
<dt><a href="#getSysConfRoot">getSysConfRoot()</a></dt>
<dd><p>Document</p>
</dd>
<dt><a href="#getSourceRoot">getSourceRoot()</a></dt>
<dd><p>Document</p>
</dd>
<dt><a href="#handleError">handleError()</a></dt>
<dd><p>Handler errors.</p>
</dd>
<dt><a href="#getStackTrace">getStackTrace()</a></dt>
<dd><p>Returns stack trace string of an error.</p>
</dd>
<dt><a href="#get">get()</a></dt>
<dd><p>Query docker for a list of network.</p>
</dd>
<dt><a href="#load">load()</a></dt>
<dd><p>Load module and inject lando api into module.</p>
</dd>
<dt><a href="#getApps">getApps()</a></dt>
<dd><p>Gets a list of apps.</p>
</dd>
<dt><a href="#getBadApps">getBadApps()</a></dt>
<dd><p>Gets a list of potentially corrupted apps.</p>
</dd>
<dt><a href="#register">register()</a></dt>
<dd><p>Adds an app to the app registry.</p>
</dd>
<dt><a href="#remove">remove()</a></dt>
<dd><p>Remove app from registry</p>
</dd>
<dt><a href="#Serializer">Serializer()</a></dt>
<dd><p>Constructor.</p>
</dd>
<dt><a href="#getEnvironment">getEnvironment()</a></dt>
<dd><p>Get an env object to inject into child process.</p>
</dd>
<dt><a href="#spawn">spawn()</a></dt>
<dd><p>Handle the spawn function</p>
</dd>
<dt><a href="#escSpaces">escSpaces(command)</a></dt>
<dd><p>Escapes the spaces in an array or string into a string to make it more CLI friendly</p>
</dd>
<dt><a href="#sh">sh()</a></dt>
<dd><p>Exec or spawn a shell command.</p>
</dd>
<dt><a href="#add">add()</a></dt>
<dd><p>Add a task.</p>
<p>Either to the global task object or the passed in object</p>
</dd>
<dt><a href="#getEngineUserId">getEngineUserId()</a></dt>
<dd><p>Document</p>
</dd>
<dt><a href="#getEngineUserGid">getEngineUserGid()</a></dt>
<dd><p>Document</p>
</dd>
<dt><a href="#compose">compose()</a></dt>
<dd><p>Utilty function that takes service object and writes a compose file</p>
</dd>
<dt><a href="#scanUrls">scanUrls()</a></dt>
<dd><p>Utilty that scans URLS to see if they are accesible</p>
</dd>
</dl>

<a name="app"></a>

## app
Module for apps.

**Kind**: global variable  
<a name="bootstrap"></a>

## bootstrap
Lando initialization system.

**Kind**: global variable  
<a name="cache"></a>

## cache
Cache module.

**Kind**: global variable  
<a name="cli"></a>

## cli
CLI module.

**Kind**: global variable  
<a name="compose"></a>

## compose
Module to wrap and abstract access to docker compose.

**Kind**: global variable  
<a name="config"></a>

## config
Config module

**Kind**: global variable  
<a name="container"></a>

## container
Module to wrap and abstract access to dockerode.

**Kind**: global variable  
<a name="daemon"></a>

## daemon
Module to interact with docker daemon

**Kind**: global variable  
<a name="docker"></a>

## docker
Router to pass request to either docker engine or docker compose

**Kind**: global variable  
<a name="engine"></a>

## engine
Module for interfacing with docker

**Kind**: global variable  
<a name="env"></a>

## env
Env module.

**Kind**: global variable  
<a name="getEnv"></a>

## getEnv
Get config

**Kind**: global variable  
<a name="error"></a>

## error
Error module.

**Kind**: global variable  
<a name="errorTags"></a>

## errorTags
Small object for adding and getting error tags.

**Kind**: global variable  
<a name="events"></a>

## events
Asynchronous event engine module.

**Kind**: global variable  
<a name="lando"></a>

## lando
Get a fully initialized lando object

**Kind**: global variable  
<a name="logger"></a>

## logger
Logging module

**Kind**: global variable  
<a name="metrics"></a>

## metrics
Anonymous metrics reporting for Lando.

**Kind**: global variable  

* [metrics](#metrics)
    * [.report()](#metrics.report)
    * [.exports.reportAction()](#metrics.exports.reportAction)
    * [.exports.reportError()](#metrics.exports.reportError)

<a name="metrics.report"></a>

### metrics.report()
Report meta data for metrics.

**Kind**: static method of [<code>metrics</code>](#metrics)  
<a name="metrics.exports.reportAction"></a>

### metrics.exports.reportAction()
Short cut for reporting actions.

**Kind**: static method of [<code>metrics</code>](#metrics)  
<a name="metrics.exports.reportError"></a>

### metrics.exports.reportError()
Document

**Kind**: static method of [<code>metrics</code>](#metrics)  
<a name="network"></a>

## network
Module to wrap and abstract access to dockerode's network stuff.

**Kind**: global variable  
<a name="lando"></a>

## lando
Lando node helpers

**Kind**: global variable  
<a name="plugins"></a>

## plugins
Plugins module

**Kind**: global variable  
<a name="promise"></a>

## promise
Promises module

**Kind**: global variable  
<a name="registry"></a>

## registry
Handles app registration.

**Kind**: global variable  
<a name="serializer"></a>

## serializer
Class for abstracting serializing of promises within the process.

**Kind**: global variable  
<a name="shell"></a>

## shell
Shell module

**Kind**: global variable  
<a name="esc"></a>

## esc
Escapes an array or string into a string to make it more CLI friendly

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> \| <code>Array</code> | The command to run. |

<a name="which"></a>

## which
Do a which

**Kind**: global variable  
<a name="tasks"></a>

## tasks
Tasks module.

**Kind**: global variable  
<a name="tasks"></a>

## tasks
Place to store global tasks

**Kind**: global variable  
<a name="largv"></a>

## largv
Get global lando verbose arg

**Kind**: global variable  
<a name="user"></a>

## user
User module

**Kind**: global variable  
<a name="utils"></a>

## utils
Utils module

**Kind**: global variable  
<a name="list"></a>

## list()
Lists all the users apps known to Lando.

**Kind**: global function  
<a name="get"></a>

## get()
Get an app object

**Kind**: global function  
<a name="isRunning"></a>

## isRunning()
Returns whether an app is running or not

**Kind**: global function  
<a name="exists"></a>

## exists()
Returns true if app with given app name exists.

**Kind**: global function  
<a name="info"></a>

## info()
Gets information about an app

**Kind**: global function  
<a name="uninstall"></a>

## uninstall()
Uninstalls an app's components

**Kind**: global function  
<a name="cleanup"></a>

## cleanup()
Attempts to clean up corrupted apps. internal will compare the appRegistry
with kbox.list to determine apps that may have orphaned containers. If
those apps do have orphaned containers then we remove those containers
and finally the corrupted app from the appRegisty.

**Kind**: global function  
<a name="start"></a>

## start()
Starts an app's components.

**Kind**: global function  
<a name="stop"></a>

## stop()
Stops an app's components

**Kind**: global function  
<a name="restart"></a>

## restart()
Stops and then starts an app's components.

**Kind**: global function  
<a name="destroy"></a>

## destroy()
Uninstalls an app's components including the data container, and removes
the app's code directory.

**Kind**: global function  
<a name="rebuild"></a>

## rebuild()
Rebuilds an apps containers. this will stop an app's containers, remove all
of them except the data container, pull down the latest versions of the
containers as specified in the app's .lando.yml. You will need to run
`kbox start` when done to restart your app.

**Kind**: global function  
<a name="set"></a>

## set()
Override set to add logging

**Kind**: global function  
<a name="get"></a>

## get()
Override get to add logging

**Kind**: global function  
<a name="remove"></a>

## remove()
Override del to add logging

**Kind**: global function  
<a name="Table"></a>

## Table()
Create a new CLI table

**Kind**: global function  
<a name="init"></a>

## init()
Initialize the CLI

**Kind**: global function  
<a name="list"></a>

## list()
Query docker for a list of containers.

**Kind**: global function  
<a name="findContainer"></a>

## findContainer()
Find a docker container.

**Kind**: global function  
<a name="inspect"></a>

## inspect()
Inspect a container.

**Kind**: global function  
<a name="isRunning"></a>

## isRunning()
Return true if the container is running otherwise false.

**Kind**: global function  
<a name="stop"></a>

## stop()
Stop a container.

**Kind**: global function  
<a name="run"></a>

## run()
Do a docker run

**Kind**: global function  
**Todo:**: we can get rid of this once docker compose run
supports interactive mode on windows  
<a name="remove"></a>

## remove()
Remove a container.

**Kind**: global function  
<a name="list"></a>

## list()
Query docker for a list of containers.

**Kind**: global function  
<a name="inspect"></a>

## inspect()
Inspect a container.

**Kind**: global function  
<a name="isRunning"></a>

## isRunning()
Return true if the container is running otherwise false.

**Kind**: global function  
<a name="start"></a>

## start()
Start container(s).

**Kind**: global function  
<a name="exists"></a>

## exists()
Check if container exists

**Kind**: global function  
<a name="run"></a>

## run()
Create and run a command inside of a container.

**Kind**: global function  
<a name="stop"></a>

## stop()
Stop a container.

**Kind**: global function  
<a name="remove"></a>

## remove()
Remove a container.

**Kind**: global function  
<a name="build"></a>

## build()
Builds and/or pulls a docker image

**Kind**: global function  
<a name="up"></a>

## up()
Turns the docker daemon on

**Kind**: global function  
<a name="isUp"></a>

## isUp()
Returns the state of the docker daemon

**Kind**: global function  
<a name="down"></a>

## down()
Shuts the docker daemon off.

**Kind**: global function  
<a name="isRunning"></a>

## isRunning()
Tells you if a container is running.

**Kind**: global function  
<a name="list"></a>

## list()
Lists installed containers.

**Kind**: global function  
<a name="exists"></a>

## exists()
Returns whether a container exists or not.

**Kind**: global function  
<a name="inspect"></a>

## inspect()
Inspects a container and returns details.

**Kind**: global function  
<a name="start"></a>

## start()
Starts container(s)

**Kind**: global function  
<a name="run"></a>

## run()
Runs a command in a container, in interactive mode

**Kind**: global function  
<a name="stop"></a>

## stop()
Stops container(s).

**Kind**: global function  
<a name="destroy"></a>

## destroy()
Removes a container from the engine.

**Kind**: global function  
<a name="build"></a>

## build()
Pulls or builds images.

**Kind**: global function  
<a name="getHomeDir"></a>

## getHomeDir()
Document

**Kind**: global function  
<a name="getUserConfRoot"></a>

## getUserConfRoot()
Document

**Kind**: global function  
<a name="getSysConfRoot"></a>

## getSysConfRoot()
Document

**Kind**: global function  
<a name="getSourceRoot"></a>

## getSourceRoot()
Document

**Kind**: global function  
<a name="handleError"></a>

## handleError()
Handler errors.

**Kind**: global function  
<a name="getStackTrace"></a>

## getStackTrace()
Returns stack trace string of an error.

**Kind**: global function  
<a name="get"></a>

## get()
Query docker for a list of network.

**Kind**: global function  
<a name="load"></a>

## load()
Load module and inject lando api into module.

**Kind**: global function  
<a name="getApps"></a>

## getApps()
Gets a list of apps.

**Kind**: global function  
<a name="getBadApps"></a>

## getBadApps()
Gets a list of potentially corrupted apps.

**Kind**: global function  
<a name="register"></a>

## register()
Adds an app to the app registry.

**Kind**: global function  
<a name="remove"></a>

## remove()
Remove app from registry

**Kind**: global function  
<a name="Serializer"></a>

## Serializer()
Constructor.

**Kind**: global function  
<a name="Serializer+enqueue"></a>

### serializer.enqueue()
Add a function to the serialized queue.

**Kind**: instance method of [<code>Serializer</code>](#Serializer)  
<a name="getEnvironment"></a>

## getEnvironment()
Get an env object to inject into child process.

**Kind**: global function  
<a name="spawn"></a>

## spawn()
Handle the spawn function

**Kind**: global function  
<a name="escSpaces"></a>

## escSpaces(command)
Escapes the spaces in an array or string into a string to make it more CLI friendly

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> \| <code>Array</code> | The command to run. |

<a name="sh"></a>

## sh()
Exec or spawn a shell command.

**Kind**: global function  
<a name="add"></a>

## add()
Add a task.

Either to the global task object or the passed in object

**Kind**: global function  
<a name="getEngineUserId"></a>

## getEngineUserId()
Document

**Kind**: global function  
<a name="getEngineUserGid"></a>

## getEngineUserGid()
Document

**Kind**: global function  
<a name="compose"></a>

## compose()
Utilty function that takes service object and writes a compose file

**Kind**: global function  
<a name="scanUrls"></a>

## scanUrls()
Utilty that scans URLS to see if they are accesible

**Kind**: global function  
