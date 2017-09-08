node
====

[Node.js](https://nodejs.org/en/) is a JavaScript runtime built on Chrome's V8 JavaScript engine and uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. Beyond running web applications, it is also commonly used for front-end tooling. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [8](https://hub.docker.com/r/_/node/)
*   [8.4](https://hub.docker.com/r/_/node/)
*   [6](https://hub.docker.com/r/_/node/)
*   [6.11](https://hub.docker.com/r/_/node/)
*   [boron](https://hub.docker.com/r/_/node/)
*   [4](https://hub.docker.com/r/_/node/)
*   [4.8](https://hub.docker.com/r/_/node/)
*   [argon](https://hub.docker.com/r/_/node/)
*   [latest](https://hub.docker.com/r/_/node/)
*   custom

Example
-------

{% codesnippet "./../examples/node/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/node).
