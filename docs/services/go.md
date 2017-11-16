go
==

[Go](https://golang.org/) is an open source programming language that makes it easy to build simple, reliable, and efficient software. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [1.8.4](https://hub.docker.com/r/_golang/)
*   [1.8](https://hub.docker.com/r/_golang/)
*   [latest](https://hub.docker.com/r/_/_golang/)
*   custom

Example
-------

{% codesnippet "./../examples/go/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/go).
