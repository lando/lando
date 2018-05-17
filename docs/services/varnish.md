Varnish
=======

[Varnish Cache](https://varnish-cache.org/intro/index.html#intro) is a web application accelerator also known as a caching HTTP reverse proxy. You install it in front of any server that speaks HTTP and configure it to cache the contents. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[4.1](https://hub.docker.com/r/eeacms/varnish/)** **(default)**
*   custom

Using patch versions
--------------------

Because we use our own custom image for `php` specifying a patch version is not currently supported. If you need to use a patch version you might be able to use our [advanced service config](https://docs.devwithlando.io/config/advanced.html).

Example
-------

{% codesnippet "./../examples/varnish/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/varnish).
