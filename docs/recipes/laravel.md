Laravel
=======

[Laravel](https://laravel.com/) is a free, open-source PHP web framework created by Taylor Otwell and intended for the development of web applications following the model–view–controller (MVC) architectural pattern. It is the Ruby-on-Rails of PHP.

You can easily boot up a best practices stack to run and develop Laravel by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: laravel
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `laravel` recipe. If you just want to learn how to get up and running with a `laravel` app check out our [Getting Start With Laravel Guide](./../tutorials/laravel.md).

Example .lando.yml
------------------

{% codesnippet "./../examples/laravel/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/laravel).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
