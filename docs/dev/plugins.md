Plugins
=======

Lando has an advanced plugin system that allows developers to add and extend Landos's core functionality. Here are a few examples of things you can do with plugins:

1.  Create CLI commands like `lando danceparty`
2.  Add services like `solr`, `redis` or `ruby`
3.  Add additional configuration options and functionality to `.lando.yml`
3.  Hook into various Lando runtime events to provide additional functionality.
4.  Print "A British tar is a soaring soul!" after every app is started.

Plugin Basics
-------------

Plugins give you access to the [Lando API](./api/lando.md) so that you can modify and/or extend Lando. Here is the part of the sharing plugin that adds some sharing config options to the Lando global config.

{% codesnippet "./../plugins/lando-sharing/lib/bootstrap.js" %}{% endcodesnippet %}

Running your own plugins
------------------------

To get your plugin working with Lando do two things:

1.  Add your plugin to the list in `config.yml`.
2.  Place your plugin into the correct location.

Lando looks for plugins in either the `node_modules` or `plugins` folder in three separate locations. If there are multiple instances of the same plugin, Lando will load the one found furthest down this list:

1.  The source directory.
2.  Inside of the `sysConfRoot`. For example `/usr/share/lando` on Linux.
3.  Inside of the `userConfRoot`. For example `~/.lando/` on macOS.

> #### Hint::Where are `sysConfRoot` and `userConfRoot`?
>
> Run `lando config` to find the location of these directories as they can be different.

Plugin Examples
---------------

Check out some of our [core plugins](https://github.com/kalabox/lando/tree/master/plugins) for motivation in creating your own.
