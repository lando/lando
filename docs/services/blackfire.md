Blackfire
=====

[Blackfire](https://blackfire.io/) is a PHP applications profiler. This image contains the agent and CLI tools.
You mostly use this in combination with a service containing PHP with the Blackfire PHP Probe extension.
The Lando PHP services (version `5.4` and up) have integration out of the box. 
You can easily add Blackfire to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.
You don't need to do this manually when you using a LAMP/LEMP based recipe.

Supported versions
------------------

*   [1.15.0](https://hub.docker.com/r/blackfire/blackfire/)
*   [latest](https://hub.docker.com/r/blackfire/blackfire/)
*   custom

Environment variables
---------------------

Before starting the service make sure you exported the Blackfire server ID and token to your environment.
You can obtain these via your [Blackfire account page](https://blackfire.io/account).


```
export BLACKFIRE_SERVER_ID=YOUR_SERVER_ID
export BLACKFIRE_SERVER_TOKEN=YOUR_SERVER_TOKEN
```

Although not required for the standalone Blackfire service, you probably use this in combination with a PHP service 

```
export BLACKFIRE_CLIENT_ID=YOUR_CLIENT_ID
export BLACKFIRE_CLIENT_TOKEN=YOUR_CLIENT_TOKEN
```

Example
-------

{% codesnippet "./../examples/blackfire/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/blackfire).
