---
description: Lando sets a bunch of useful environment variables in each service by default, or you can inject your own by configuring your Landofile or using a custom environment file.
---

# Plugins

As of Lando `3.0.8` you can now load plugins from inside your application using `pluginDirs` in your Landofile. This is in addition to custom plugins that are automatically loaded from `~/.lando/plugins`.

```yaml
name: my-app
pluginDirs:
  - plugins
  - someplace/else
```

Note that these are relative to your application's root directory. Plugin functionality is the main part of Lando `3.1` so expect more improvements here based on [this spec](https://github.com/lando/lando/issues/2434).

For more information on writing plugins check out [these docs](./../contrib/contrib-plugins.md).
