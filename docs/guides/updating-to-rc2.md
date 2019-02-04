Updating to 3.0.0-rc.2+
=======================

Before you begin here we *highly recommend* you check out the [RC2 Release Blog Post](https://thinktandem.io/blog/2019/02/01/lando-is-ready-for-the-masses-with-rc2-release/) to get a higher level understanding on whats changed and why its changed in `3.0.0-rc.2`. After that you should be ready to get into the nitty gritty of what has changed.

**This guide is for people upgrading from `3.0.0-rc.1` or lower**.

Here are the various things that have changed to your [Landofiles](./../config/lando.yml) syntax. We've tried to order them from the most common or most breaking config to the least. Note that this guide might not be an exhaustive list of all breaking changes and you are still *highly encouraged* to check out the other docs if you are running into an error running your older Landofiles on `3.0.0-rc.2` or higher.

<!-- toc -->

New Images
----------

We've rebased a lot our services on [Bitnamis](https://github.com/bitnami) which means it's **highly likely** you will need to `lando destroy` your app and then `lando start` it again. It's worth trying to see if things "just work" but if you run into an error using RC2 holla at this

```bash
lando destroy
lando start
```

Note that a `lando rebuild` is not sufficient and a `lando destroy` is needed. Also note that this will **destroy your applications perisitent storage eg your database data, solr index, etc**. If you have data you want to save, its a good idea to do something like this.

```bash
lando db-export dump.sql
lando destroy -y
lando start
lando db-import dump.sql.gz
```

Overrides
---------

We've slightly changed the syntax of [service overrides](./../config/services.md#overrides) to make things more readable. All you need to do is move things up one level

**old**

```yaml
services:
  html:
    type: apache:custom
    overrides:
      services:
        environment:
          STUFF: THINGS
          THINGS: GUYS
        image: pirog/myapache:2
```

**new**

```yaml
services:
  html:
    type: apache:custom
    overrides:
      environment:
        STUFF: THINGS
        THINGS: GUYS
      image: pirog/myapache:2
```

A consequence of this is that you can no longer overrides top level `volumes` and `networks`. If you need to edit those things we recommend you look at using our [custom compose service](./../tutorials/compose.md) instead.

Check out [this example](https://github.com/lando/lando/tree/master/examples/services) which is tested on every build for some examples of new override syntax.

Internal Service Name Changes
-----------------------------

Lando still manages some services internally such as an [nginx](./../tutorials/nginx.md) service when you use `ssl` with [varnish](./../tutorials/varnish.md) or set `via: nginx` with [php](./../tutorials/php.md) however we've changed the default names of these services so they are namespaced better.

The names of these services will be the same as before except they will now be prefixed by the service that generated them. For example if you have a `php` service using `nginx` and it is named `appserver` then Lando will spin up an internal nginx service called `appserver_nginx.`

Pain for this change will likely manifest if you have custom [proxy settings](./../config/proxy.md).

**old**

```yaml
proxy:
  nginx:
    - myapp.lndo.site
service:
  myservice:
    type: php
    via: nginx
```

**new**

```yaml
proxy:
  myservice_nginx:
    - myapp.lndo.site
service:
  myservice:
    type: php
    via: nginx
```

This can also be an issue if you are using the service name to set a base url or config envvars.

**old**

```yaml
services:
  appserver:
    overrides:
      environment:
        BASEURL: http://nginx
```


In these situations we prefer you use an option available via our [networking](./../config/networking.md).

**new**

```yaml
name: myapp
services:
  appserver:
    overrides:
      environment:
        BASEURL: https://appserver_nginx.myapp.internal
```

```yaml
name: myapp
proxy:
  appserver_nginx:
    - myapp.lndo.site
services:
  appserver:
    overrides:
      environment:
        BASEURL: https://myapp.lndo.site
```

Tooling
-------

We've altered our [tooling](./../config/tooling.md) so that it is more in line with our [events](./../config/events.md) syntax. That means you will likely want to alter two of the following scenarios.

### Multi-line commands

Tooling commands that are expressed as arrays now represent multiple **commands** instead of **arguments** to a single command. So you will want to change scenarios like this

**old**

```yaml
tooling:
  drush:
    service: appserver
    cmd:
      - drush
      - --root
      - /app/PATH/TO/WEBROOT
```

**new**

```yaml
tooling:
  drush:
    service: appserver
    cmd: drush --root=/app/PATH/TO/WEBROOT
```

Check out [this example](https://github.com/lando/lando/tree/master/examples/tooling) which is tested on every build for some examples of new tooling syntax.

### Eventy commands

If you were using [events](./../config/events.md) as a [tricky way](https://github.com/lando/lando/blob/v3.0.0-rc.1/docs/tutorials/setup-additional-tooling.md#multi-service-tooling-with-events) to run multiple commands on multiple services you can now do that [directly with tooling](./../config/tooling.md#multi-service-multi-command-tooling).

**old**

```yaml
events:
  post-update:
    - appserver: cd $LANDO_MOUNT && composer install
    - node: cd $LANDO_MOUNT && gulp
    - appserver: cd $LANDO_WEBROOT && drush updb -y
tooling:
  update:
    service: appserver
    description: Builds local dependencies, compiles SASS, runs DB updates
    cmd: 'true'
```

**new**

```yaml
tooling:
  update:
    description: Builds local dependencies, compiles SASS, runs DB updates
    cmd:
      - appserver: cd $LANDO_MOUNT && composer install
      - node: cd $LANDO_MOUNT && gulp
      - appserver: cd $LANDO_WEBROOT && drush updb -y
```

Check out [this example](https://github.com/lando/lando/tree/master/examples/tooling) which is tested on every build for some examples of new tooling syntax.

Build Steps
-----------

While we've maintained decent backwards compatibility with previous build step names we recommend you update to the [new syntax](./../config/services.md#build-steps) and be mindful that build steps can now run **before** and **after** your application starts.

**old**

```yaml
services:
  appserver:
    type: php
    build_as_root:
      - command1
    install_dependencies_as_root:
      - command2
    build:
      - command3
    install_dependencies_as_me:
      - command4
    run_as_root:
      - command5
    extras:
      - command6
    run:
      - command7
    run_as_me
      - command8
```

**new**

```yaml
services:
  appserver:
    type: php
    build_as_root:
      - command1
      - command2
    build:
      - command3
      - command4
    run_as_root:
      - command5
      - command6
    run:
      - command7
      - command8
```

If you have been using either of the following *unsupported* syntaxes then make sure you also read about [using scripty things](./../config/services.md#using-scripty-things) in your build steps.

```yaml
run:
  - |
    if [ ! -z $LANDO_MOUNT ]; then
      do something
      some other command
    fi
```

```yaml
run:
  - if [ ! -z $LANDO_MOUNT ]; then do-stuff; fi
```

Check out [this example](https://github.com/lando/lando/tree/master/examples/services) which is tested on every build for some examples of new build step syntax.


Global Environment Variables
----------------------------

Lando no longer sets its [default environment variables](./../config/env.md) on your host machine. They are now **service only**. While this usage has actually been deprecated for quite some time you may still be doing stuff like this.

**old**

```yaml
events:
  post-start:
    - appserver: cd $LANDO_MOUNT && some-command
services:
  appserver:
    build:
      - cd $LANDO_MOUNT && some-other-command
    overrides:
      services:
        volumes:
        - $LANDO_APP_ROOT_BIND/.lando/build-sh-setup.sh:/helpers/build-sh-setup.sh
        - $LANDO_ENGINE_CONF/.lando/build.sh:/helpers/build.sh
```

We have standardized these locations for quite some time and they **will not be changing** so you can now just do.

**new**

```yaml
events:
  post-start:
    - appserver: some-command
services:
  appserver:
    build:
      - some-other-command
    overrides:
      volumes:
        # You can use paths relative to your apps root directory
        - ./.lando/build-sh-setup.sh:/helpers/build-sh-setup.sh
```

For `events` and `build-steps` these commands will be run from the `$LANDO_MOUNT` by default.

Tooling commands will be run from the container analog of your `cwd`.

If you find yourself **needing** to hard enter `$LANDO_MOUNT` you can safely just use `/app` as `$LANDO_MOUNT` will not change unless you've explicitly overridden it.

```yaml
events:
  post-start:
    - appserver: cd /app && command-that-def-needs-to-be-run-from-here
```

Note that in the case of something like `$LANDO_ENGINE_CONF` your application's `root` directory, the entire `~/.lando` config directory, and your user home folder are [already available inside every container](./../config/files.md) by default so you should invoke them directly instead of re-mounting them.

### Accessing Environment variables in events, build-steps, tooling etc

You can, however, still use the environment variables available in each service in your Landofiles by wrapping their invocation with `sh` or `bash`. This will explicitly let Lando know you want to use environment variables in the service and not the host. Note that while you **can** do this it's almost always better to just explicitly refer to things.

**works but not recommended**

```yaml
events:
  post-start:
    - /bin/sh -c 'cd "/app/$LANDO_APP_PROJECT" && do-something'
```

**works AND recommended**

```yaml
events:
  post-start:
    - cd /app/landoservices && do-something
```

Service Versions
----------------

Most service versions have stayed the same but a few have changed. If you try to run a now-unsupported service version Lando will throw a nice red error. If this happens to you check out the supported version documented for each service and either choose the closest one to what you have **OR** remove the version completely and use the default.

*   ####[apache](./../tutorials/apache.md)
*   ####[custom](./../tutorials/compose.md)
*   ####[dotnet](./../tutorials/dotnet.md)
*   ####[elasticsearch](./../tutorials/elasticsearch.md)
*   ####[go](./../tutorials/go.md)
*   ####[mailhog](./../tutorials/mailhog.md)
*   ####[mariadb](./../tutorials/mariadb.md)
*   ####[memcached](./../tutorials/memcached.md)
*   ####[mongo](./../tutorials/mongo.md)
*   ####[mssql](./../tutorials/mssql.md)
*   ####[mysql](./../tutorials/mysql.md)
*   ####[nginx](./../tutorials/nginx.md)
*   ####[node](./../tutorials/node.md)
*   ####[php](./../tutorials/php.md)
*   ####[phpmyadmin](./../tutorials/phpmyadmin.md)
*   ####[postgres](./../tutorials/postgres.md)
*   ####[python](./../tutorials/python.md)
*   ####[redis](./../tutorials/redis.md)
*   ####[ruby](./../tutorials/ruby.md)
*   ####[solr](./../tutorials/solr.md)
*   ####[tomcat](./../tutorials/tomcat.md)
*   ####[varnish](./../tutorials/varnish.md)

Environment Files
-----------------

You now have to explicitly set the top level [`env_file`](./../config/env.md#environment-files) if you want to load a `env` file.

**old**

*Had a `.env` file in Lando root directory*

**new**

```yaml
env_file:
  - .env
```

Check out [this example](https://github.com/lando/lando/tree/master/examples/base) which is tested on every build for some examples of the new environment file syntax.

Drush Handling
--------------

We've vastly simplified our [Drush handling](./../tutorials/drupa8.md#using-drush). You can now only set `drush` to a particular version for global installation. If you've installed `drush` via `composer` then Lando will use that version instead of the one in your Landofile.

**old**

```yaml
recipe: drupal8
config:
  drush: none
```

```yaml
recipe: drupal8
config:
  drush: composer
```

```yaml
recipe: drupal8
config:
  drush: /path/to/my/drush
```

**new**

```yaml
recipe: drupal8
```

```yaml
recipe: drupal8
config:
  drush: 8.1.15
```

Rebuild vs. Restart
-------------------

If you change your Landofiles you now need to explicitly [`lando rebuild`](./../cli/rebuild.md) instead of running [`lando restart`](./../cli/rebuild.md). This helps to provide stability between restarts until you explicitly ask for things to change and vastly speeds up stops and starts.

**old**

*changed `.lando.yml`*

```bash
lando restart
```

**new**

*changed `.lando.yml`*

```bash
lando rebuild -y
```

Lando Init
----------

We've completely reworked [`lando init`](./../cli/init.md) to be more modular and intuitive. This means if you've got scripts relying on `lando init` you will likely need to make some changes. While there are many changes the biggest are the removal of the "init method" in favor of the `--source` option.


**old**

```bash
lando init pantheon
```

**new**

```bash
lando init --source pantheon
```

**sources** are places where Lando can get your code and **recipes** are the kinds of applications that exists at **source**.

Global Options
--------------

Lando no longer uses [`--`](https://github.com/lando/lando/blob/v3.0.0-rc.1/docs/cli/usage.md#global-options) to differentiate between its options and tooling options.

**old**

```bash
# Verbose modes
lando start -- -v
lando start -- -vv
lando start -- -vvv
lando start -- -vvvv

# Lando help
lando start -- --help
```

**new**

```bash
# Verbose modes
lando start -v
lando start -vv
lando start -vvv
lando start -vvvv

# Lando help
lando start --lando
```

A nice consequence of this is you can now use `--` in other tooling commands and have more predictable tooling results

```bash
# Use -- in a command
lando terminus remote:drush "$SITE.$ENV" -- cr --all -y

# Worry less about escaping crap
lando php -e "phpinfo();"
```

Global Envvars
--------------

There is no longer a `containerGlobalEnv` option in the Lando [global config](./../config/config.md). But you can now use `appEnv` to the same effect. **Note that this is for the Lando `config.yml` and NOT for a Landofile**.

**old**

```yaml
containerGlobalEnv:
  PARTY: USA
```

**new**

```yaml
appEnv:
  PARTY: USA
```

App Registry
------------

There is no longer a register of apps stored at `~/.lando/cache/registry`. As a consequence you can no longer do things like `lando start MYAPP`

```bash
lando start MYAPP
```

**new**

```bash
cd /path/to/MYAPP
lando start
```

Plugins
-------

If you have written your own custom plugins

1. Sorry!! :/
2. Once you see the new format you'll feel better :)

We've finally locked down a [Plugin System](./../dev/plugins.md) that uses the [Lando](./../api/lando.md) and [App](./../api/app.md) APIs and while we still don't have a great way to manage the installation and management of these plugins it is going to be the defining feature of `3.1.0`.

Additional Reading
------------------

{% include "./../snippets/guides.md" %}

