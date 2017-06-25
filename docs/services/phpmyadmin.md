phpMyAdmin
==========

[phpMyAdmin](https://www.phpmyadmin.net/) phpMyAdmin is a free software tool written in PHP, intended to handle the administration of MySQL over the Web. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   4.7
*   4.6
*   latest
*   custom

Example
-------

{% codesnippet "./../examples/pma/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` for changes to this file to take. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/pma)
