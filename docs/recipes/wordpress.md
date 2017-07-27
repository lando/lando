WordPress
=========

[WordPress](https://wordpress.org) is open source software you can use to create a beautiful website, blog, or app.

You can easily boot up a best practices stack to run and develop WordPress by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: wordpress
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `wordpress` recipe. If you just want to learn how to get up and running with a `wordpress` app check out our [Getting Start With WordPress Guide](./../tutorials/wordpress.md).

Example
-------

{% codesnippet "./../examples/wordpress/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/wordpress).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
