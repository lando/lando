MEAN
====

[MEAN](http://mean.io/) is a common technology stack designed to run `node` applications. It specifically means **M**ongo, **E**xpress **A**angular and **N**ode but is usually generalized to include other front end frameworks like `react` or `vue`.

You can easily boot up a MEAN stack for your app by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: mean
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `mean` recipe. If you just want to learn how to get up and running with a `mean` app check out our [Getting Start With MEAN Guide](./../tutorials/mean.md).

Example
-------

{% codesnippet "./../examples/mean/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/mean).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
