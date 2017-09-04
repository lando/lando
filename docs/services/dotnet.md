Dotnet
======

[Dotnet](https://en.wikipedia.org/wiki/.NET_Framework)  is a software framework developed by Microsoft that runs primarily on Microsoft Windows. It includes a large class library named Framework Class Library (FCL) and provides language interoperability (each language can use code written in other languages) across several programming languages. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [2](https://hub.docker.com/r/microsoft/dotnet/)
*   [2.0](https://hub.docker.com/r/microsoft/dotnet/)
*   [1](https://hub.docker.com/r/microsoft/dotnet/)
*   [1.1](https://hub.docker.com/r/microsoft/dotnet/)
*   [1.0](https://hub.docker.com/r/microsoft/dotnet/)
*   [latest](https://hub.docker.com/r/microsoft/dotnet/)
*   custom

Example
-------

{% codesnippet "./../examples/dotnet/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/dotnet).
