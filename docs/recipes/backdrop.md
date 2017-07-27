Backdrop
========

[Backdrop](https://backdropcms.org/) is the comprehensive CMS for small to medium sized businesses and non-profits. Backdrop CMS is free and Open Source. There are no acquisition fees or licensing costs.

You can easily boot up a best practices stack to run and develop Backdrop by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: backdrop
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `backdrop` recipe. If you just want to learn how to get up and running with a `backdrop` app check out our [Getting Start With Backdrop Guide](./../tutorials/backdrop.md).

Example
-------

{% codesnippet "./../examples/backdrop/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/backdrop).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
