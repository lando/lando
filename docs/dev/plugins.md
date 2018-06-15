Plugins
=======

Lando has an advanced plugin system that allows developers to add and extend Lando's core functionality. Here are a few examples of things you can do with plugins:

1.  Create CLI commands like `lando danceparty`
2.  Add services like `solr`, `redis` or `ruby`
3.  Add additional configuration options and functionality to `.lando.yml`
3.  Hook into various Lando runtime events to provide additional functionality.
4.  Print "A British tar is a soaring soul!" after every app is started.

Plugin Basics
-------------

Plugins give you access to the [Lando API](./../api/api.md) so that you can modify and/or extend Lando. Here is the main entrypoint of the engine plugin that adds the `lando.engine` module and handles engine config.

{% codesnippet "./../plugins/lando-engine/index.js" %}{% endcodesnippet %}

Running your own plugins
------------------------

You can add plugins either globally or in individual apps by adding your plugin to the global `config.yml` or an individual app's `.lando.yml`.

```yaml
plugins:
  - my-plugin
```

In the above example Lando looks for a plugin in a folder called `my-plugin` in either the `node_modules` or `plugins` folders. For app plugins these locations will be relative to the app root directory. For global plugins the locations specified in `pluginDirs` in `lando config` will be scanned.

If there are multiple occurences of the same-named plugin, Lando will use the one "closest to your app". This means that `lando` will priortize in-app plugins and then priortize the locations in `pluginDirs` from last to first.

**A powerful corollary to this is that indiviual apps can implement plugins that override global plugin behavior.**

> #### Hint::Where is `config.yml`?
>
> Check out the [global config docs](./../config/config.md) if you are unclear where to change this file.

Plugin Examples
---------------

Check out some of our [core plugins](https://github.com/lando/lando/tree/master/plugins) for motivation in creating your own.
