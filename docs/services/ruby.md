Ruby
====

[Ruby](https://www.ruby-lang.org/en/) A dynamic, open source programming language with a focus on simplicity and productivity. It has an elegant syntax that is natural to read and easy to write. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[2.4](https://hub.docker.com/r/_/ruby/)** **(default)**
*   [2.2](https://hub.docker.com/r/_/ruby/)
*   [2.1](https://hub.docker.com/r/_/ruby/)
*   [1.9](https://hub.docker.com/r/_/ruby/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/ruby/tags/) are all the tags that are available for this service.

Here is an example of overriding the `nginx` service to use a patched version.

{% codesnippet "./../examples/patchversion/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/patchversion).

Example
-------

{% codesnippet "./../examples/ruby/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/ruby).
