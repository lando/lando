nginx
=====

[nginx](https://www.nginx.com/resources/wiki/) is a very common webserver and reverse proxy which you can easily add to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [1.13](https://hub.docker.com/r/_/nginx/)
*   [1.12](https://hub.docker.com/r/_/nginx/)
*   [1.11](https://hub.docker.com/r/_/nginx/)
*   [1.10](https://hub.docker.com/r/_/nginx/)
*   [1.9](https://hub.docker.com/r/_/nginx/)
*   [1.8](https://hub.docker.com/r/_/nginx/)
*   [mainline](https://hub.docker.com/r/_/nginx/)
*   [stable](https://hub.docker.com/r/_/nginx/)
*   [latest](https://hub.docker.com/r/_/nginx/)
*   custom

Example
-------

{% codesnippet "./../examples/nginx/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/nginx).
