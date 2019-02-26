Lando + PhpStorm + Xdebug
=============================

[PhpStorm](https://www.jetbrains.com/phpstorm/) is a popular code IDE for PHP
and Drupal development. This video tutorial shows you how to set up PhpStorm with Xdebug.

{% youtube %}
https://www.youtube.com/watch?v=sHNJxx0L9r0
{% endyoutube %}

### Debugging Drush Commands
By default our Drupal recipes come with Drush out of the box. In order to debug any Drush command using Xdebug using
PhpStorm or a similar IDE, you will need to set an additional environment variable `PHP_IDE_CONFIG` and configure the 
path mapping in your IDE accordingly.

```yaml
services:
  appserver:
    overrides:
      environment:
        # Support debugging Drush with XDEBUG.
        PHP_IDE_CONFIG: "serverName=appserver"
```

You are free to assign any name to "serverName" as long as it matches the server you define in the IDE settings.
In the example above we set the variable to `appserver` and created a path mapping for the server accordingly:

![screenshot](https://raw.githubusercontent.com/lando/lando/master/docs/images/drush-xdebug-phpstorm.png)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
