nginx
=====

[nginx](https://www.nginx.com/resources/wiki/) is a very common webserver and reverse proxy which you can easily add to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[1.13](https://hub.docker.com/r/_/nginx/)** **(default)**
*   [1.12](https://hub.docker.com/r/_/nginx/)
*   [1.11](https://hub.docker.com/r/_/nginx/)
*   [1.10](https://hub.docker.com/r/_/nginx/)
*   [1.9](https://hub.docker.com/r/_/nginx/)
*   [1.8](https://hub.docker.com/r/_/nginx/)
*   [mainline](https://hub.docker.com/r/_/nginx/)
*   [stable](https://hub.docker.com/r/_/nginx/)
*   custom

Using patch versions
--------------------

While Lando does not "officially" support specifying a patch version of this service you can try specifying one using [overrides](https://docs.devwithlando.io/config/advanced.html#overriding-with-docker-compose) if you need to. **This is not guaranteed to work** so use at your own risk and take some care to make sure you are using a `debian` flavored patch version that also matches up with the `major` and `minor` versions of the service that we indicate above in "Supported versions".

[Here](https://hub.docker.com/r/library/nginx/tags/) are all the tags that are available for this service.

Here is an example of overriding the `nginx` service to use a patched version.

{% codesnippet "./../examples/patchversion/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/patchversion).

Example
-------

{% codesnippet "./../examples/nginx/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/nginx).
