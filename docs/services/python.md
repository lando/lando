Python
======

[Python](https://www.python.org/) is a programming language that lets you work more quickly and integrate your systems more effectively. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [3](https://hub.docker.com/r/_/python/)
*   **[3.6](https://hub.docker.com/r/_/python/)** **(default)**
*   [3.5](https://hub.docker.com/r/_/python/)
*   [3.4](https://hub.docker.com/r/_/python/)
*   [3.3](https://hub.docker.com/r/_/python/)
*   [2](https://hub.docker.com/r/_/python/)
*   [2.7](https://hub.docker.com/r/_/python/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/python/tags/) are all the tags that are available for this service.

Here is an example of overriding the `nginx` service to use a patched version.

{% codesnippet "./../examples/patchversion/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/patchversion).

Example
-------

{% codesnippet "./../examples/python/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/python).
