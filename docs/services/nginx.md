nginx
=====

[nginx](https://www.nginx.com/resources/wiki/) is a very common webserver and reverse proxy which you can easily add to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   1.13
*   1.12
*   1.11
*   1.10
*   1.9
*   1.8
*   mainline
*   stable
*   latest
*   custom

Example
-------

{% codesnippet "./../examples/nginx/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/nginx).
