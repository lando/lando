php
===

[php](http://php.net/) is a popular scripting language that is especially suited for web development. It is often served by either [apache](./apache.md) or [nginx](./nginx.md) You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   7.1
*   7.0
*   5.6
*   5.5
*   5.4
*   5.3
*   latest
*   custom

LAMP Example
------------

{% codesnippet "./../examples/lamp/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/lamp)

LEMP Example
------------

{% codesnippet "./../examples/lemp/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/lemp)

Using Xdebug
------------

You can activate `xdebug` for remote debugging by setting `xdebug: true` in the config for your `php` service. This will enable `xdebug` and configure it so you can connect from your host machine. You will need to configure your IDE so that it can connect. Here is some example config for [ATOM's](https://atom.io/) [`php-debug`](https://github.com/gwomacks/php-debug) plugin:

```
"php-debug":
  {
    ServerPort: 9000
    PathMaps: [
      "/app/www;/Users/pirog/Desktop/work/lando/examples/lando/www"
    ]
  }
```

The first part of a pathmap will be the location of your code in the container. Generally, this should be `/app`. Also note that if your app is in a nested docroot you will need to append that to the paths. The example above uses an app with a nested webroot called `www`.

> #### Info::Problems starting XDEBUG
>
> If you are visting your site and xdebug is not triggering, it might be worth appending `?XDEBUG_START_SESSION=LANDO` to your request and seeing if that does the trick.
