Build Steps
===========

One of the great features of Lando is its ability to destroy a single planet...  we mean add additional dependencies or build steps to your app without the hassle of having to build or manage your own Dockerfiles.

> #### Hint::When should I use build steps?
>
> If you need additional on server dependencies like php extensions or node modules then sounds like a build step may be for you. Note that these steps will **ONLY RUN THE FIRST TIME YOU SPIN UP YOUR APP.** That means that if you change them you will need to run `lando rebuild` for them to re-run. If you have automation you want to run **EVERY TIME** you may want to consider using [events](./events.md).

**Please note** that these steps must make sense within the context of the container you are running them in. For example, you will not be able to run `dnf` inside of a `debian` flavored container.

Steps that run BEFORE my app starts
-----------------------------------

Most build steps need to run **BEFORE** your app actually boots up so that your app has the dependencies it needs to actually function properly. Good examples of this are `node_modules`, `apt packages`, and `php extensions`. You can do this with both the `install_dependencies_as_root` and `install_dependencies_as_me` keys. **Please take caution to only use `install_dependencies_as_root` when needed.**

Here is an example that installs the `memcached` `php` extension (which we ship with by default but is used below for illustration) before our `appserver` boots up and also installs `node_modules` on the `node` container.

> #### Hint::Where do these run?
>
> All commands run from `/app` (that is where your application code lives) by default. If you wish to change to a different directory consider doing something like `cd /mydir && some command`

```yaml
services:
  appserver:
    type: php:7.1
    install_dependencies_as_root:
      - apt-get update -y && apt-get install -y libmemcached-dev
      - pecl install memcached
      - docker-php-ext-enable memcached
  node:
    type: node:10
    install_dependencies_as_me:
      - yarn
```

Note the usage of `root` on one and not the other. Also note that each command is run in a separate shell so if you have two commands and the second depends on the first you'll want to concatenate them together into a single command with `&&`.


Steps that run AFTER my app starts
----------------------------------

While it is likely that you will want to install dependencies before your app starts can also run steps **AFTER** your app has started up using the `run` and `run_as_root` keys.

```yml
services:
  appserver:
    type: php:7.1
    run:
      - bash /app/scripts/somehelper.sh
    run_as_root
      - echo "haxmcgee 127.0.0.1 > /etc/hosts"
```

Need more power?
----------------

If you find your `.lando.yml` is getting too fat or your build time too long, we highly recommend you check out our [advanced config](./advanced.md) for some pretty nasty build power tools.
