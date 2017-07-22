.lando.yml
==========

A `.lando.yml` file is at the heart of every Lando app. It is needed to tell Lando what things your app needs for development. It usually will contain the services and tools needed to run and develop your app. This file should live in the root directory of your app's code repository and ideally be tracked in its version control system.

If you make changes to your `.lando.yml` you will need to `lando restart` your app for those changes to be applied.

Basic config
------------

The most basic `.lando.yml` file contains two entries.

{% codesnippet "./../examples/trivial/.lando.yml" %}{% endcodesnippet %}

And can be run easily.

```bash
# Navigate to the directory with above .lando.yml
cd /path/to/app

# Start the app
lando start
```

> #### Hint::Images need to be pulled!
>
> The first time you start an app it *may* need to pull down container images. This can take a moment depending on your internet connection. Subsequent pulls to that container or service are cached so they should be much faster.

You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/trivial) Keep reading to learn about more powerful configuration options for `.lando.yml`.
