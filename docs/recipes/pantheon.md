Pantheon
========

[Pantheon](https://pantheon.io) is a website management platform for Drupal & WordPress that offers elastic hosting and web development tools for teams.

You can easily mimic the Pantheon environment (`varnish/nginx/mariadb/redis/solr`) and toolchain (`drush/wp-cli/drupal/terminus`) by adding the following to your app's `.lando.yml`.

```yml
name: myapp
recipe: pantheon
```

But you likely want to configure [this more](#example).

Getting Started
---------------

This documentation is geared towards configuring the `.lando.yml` for the `pantheon` recipe. If you just want to learn how to get up and running with a `pantheon` app check out our [Getting Start With Pantheon Guide](./../tutorials/pantheon.md).

Example
-------

{% codesnippet "./../examples/pantheon/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/pantheon).

Advanced Configuration
----------------------

If you are looking to add additional [services](./../config/services.md), [tooling](./../config/tooling.md) or [proxy config](./../config/proxy.md) check out the [Custom Recipe Guide](./../tutorials/custom.md).
