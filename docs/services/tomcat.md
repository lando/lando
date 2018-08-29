Tomcat
======

[Tomcat](https://tomcat.apache.org/) The Apache Tomcat® software is an open source implementation of the Java Servlet, JavaServer Pages, Java Expression Language and Java WebSocket technologies. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   **[8](https://hub.docker.com/_/tomcat/)** **(default)**
*   [7](https://hub.docker.com/_/tomcat/)
*   custom

Using patch versions
--------------------

Because we use our own custom image for `php` specifying a patch version is not currently supported. If you need to use a patch version you might be able to use our [advanced service config](https://docs.devwithlando.io/config/advanced.html).

Example
-------

{% codesnippet "./../examples/tomcat/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/tomcat).
