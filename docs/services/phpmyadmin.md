phpMyAdmin
==========

[phpMyAdmin](https://www.phpmyadmin.net/) is a free software tool written in PHP, intended to handle the administration of MySQL over the Web. You can easily add it to your Lando app by adding an entry to the `services` key in your app's `.lando.yml`.

Supported versions
------------------

*   [4.7](https://hub.docker.com/r/phpmyadmin/phpmyadmin/)
*   [4.6](https://hub.docker.com/r/phpmyadmin/phpmyadmin/)
*   [latest](https://hub.docker.com/r/phpmyadmin/phpmyadmin/)
*   custom

Example
-------

{% codesnippet "./../examples/pma/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/pma).
