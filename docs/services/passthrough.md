passthrough
=====

The passthrough service isn't a specific application but a power tool for exposing arbitrary containers as a service. All properties need to be provided as part of the overides.

Supported versions
------------------
*   latest

Example
-------

{% codesnippet "./../examples/passthrough/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/passthrough).
