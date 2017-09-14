Joomla
======

[Joomla](https://www.joomla.org/) is an award-winning content management system (CMS), which enables you to build web sites and powerful online applications

You can easily boot up a best practices stack to run and developJoomla by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: joomla
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `joomla` recipe. If you just want to learn how to get up and running with a `joomla` app check out our [Getting Start With Joomla Guide](./../tutorials/joomla.md).


Example .lando.yml
------------------

{% codesnippet "./../examples/joomla/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/joomla).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
