Ruby
====

[Ruby](https://www.ruby-lang.org/en/) A dynamic, open source programming language with a focus on simplicity and productivity. It has an elegant syntax that is natural to read and easy to write. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [2.4](https://hub.docker.com/r/_/ruby/)
*   [2.2](https://hub.docker.com/r/_/ruby/)
*   [2.1](https://hub.docker.com/r/_/ruby/)
*   [1.9](https://hub.docker.com/r/_/ruby/)
*   [latest](https://hub.docker.com/r/_/ruby/)
*   custom

Example
-------

{% codesnippet "./../examples/ruby/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/ruby).
