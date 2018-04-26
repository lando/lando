Symfony 3.4
===========

[Symfony 3.4](https://symfony.com) is a set of reusable PHP components and a PHP framework for web projects.

You can easily boot up a best practices stack to run and develop Symfony 3.4 by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: symfony34
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `symfony34` recipe. If you just want to learn how to get up and running with a `symfony34` app check out our [Getting Start With Symfony 3.4 Guide](./../tutorials/symfony34.md).


Example .lando.yml
------------------

{% codesnippet "./../examples/symfony34/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/symfony34).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
