LAMP
====

[LAMP](https://en.wikipedia.org/wiki/LAMP_%28software_bundle%29) is a common technology stack designed to run `php` applications. It specifically means **L**inux, **A**pache **M**ySQL and **P**HP but is usually generalized to include other webservers like `nginx` and other SQL relational databases such as `postgres` or `sqlite`.

You can easily boot up a LAMP stack for your app by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: lamp
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `lamp` recipe. If you just want to learn how to get up and running with a `lamp` app check out our [Getting Start With LAMP Guide](./../tutorials/lamp.md).

Example
-------

{% codesnippet "./../examples/lamp2/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/lamp2).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
