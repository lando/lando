LEMP
====

[LEMP](https://lemp.io/) is a popular [LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) variant that replaces `apache` with `nginx`. It specifically means **L**inux, **(E)**nginx **M**ySQL and **P**HP.

You can easily boot up a LEMP stack for your app by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: lemp
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `lemp` recipe. If you just want to learn how to get up and running with a `lemp` app check out our [Getting Start With LEMP Guide](./../tutorials/lemp.md).

Example
-------

{% codesnippet "./../examples/lemp2/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/lemp2).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
