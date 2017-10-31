Drupal 8
========

[Drupal 8](https://www.drupal.org/drupal-8.0) is an open source platform and content management system for building amazing digital experiences. It's made by a dedicated community. Anyone can use it, and it will always be free.

You can easily boot up a best practices stack to run and develop Drupal 8 by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: drupal8
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `drupal8` recipe. If you just want to learn how to get up and running with a `drupal8` app check out our [Getting Start With Drupal 8 Guide](./../tutorials/drupal8.md).


Example .lando.yml
------------------

{% codesnippet "./../examples/drupal8/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/drupal8).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
