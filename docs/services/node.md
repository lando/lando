node
====

[Node.js](https://nodejs.org/en/) is a JavaScript runtime built on Chrome's V8 JavaScript engine and uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. Beyond running web applications, it is also commonly used for front-end tooling. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [9](https://hub.docker.com/r/_/node/)
*   [carbon](https://hub.docker.com/r/_/node/)
*   [8](https://hub.docker.com/r/_/node/)
*   **[8.9](https://hub.docker.com/r/_/node/)** **(default)**
*   [8.4](https://hub.docker.com/r/_/node/)
*   [8.0](https://hub.docker.com/r/_/node/)
*   [boron](https://hub.docker.com/r/_/node/)
*   [6](https://hub.docker.com/r/_/node/)
*   [6.10](https://hub.docker.com/r/_/node/)
*   [6.11](https://hub.docker.com/r/_/node/)
*   [6.12](https://hub.docker.com/r/_/node/)
*   [argon](https://hub.docker.com/r/_/node/)
*   [4](https://hub.docker.com/r/_/node/)
*   [4.8](https://hub.docker.com/r/_/node/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/node/tags/) are all the tags that are available for this service.

Here is an example of overriding the `nginx` service to use a patched version.

{% codesnippet "./../examples/patchversion/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/patchversion).

Example
-------

{% codesnippet "./../examples/express/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/express).
