Apache
======

[Apache](https://www.apache.org/) is a very common webserver which you can easily add to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   2.4
*   2.2
*   latest
*   custom

Example
-------

{% codesnippet "./../examples/apache/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/apache)
