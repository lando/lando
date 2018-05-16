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

Example
-------

{% codesnippet "./../examples/python/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/python).
