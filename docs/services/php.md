php
===

[php](http://php.net/) is a popular scripting language that is especially suited for web development. It is often served by either [apache](./apache.md) or [nginx](./nginx.md) You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

### Supported versions

  * 7.0
  * 5.6
  * 5.5
  * 5.3
  * latest
  * custom

### Example

{% codesnippet "./../examples/lamp/.lando.yml" %}{% endcodesnippet %}

You will need to restart your app with `lando restart` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/lamp)

