Build Steps
===========

Steps Run As You
----------------

If you want to script out some common build steps your app needs such as `composer install` or `grunt sass`, we let you run some additional commands on each service using the `run` key. **These will run directly after the container starts.**

**Please note** that these steps must make sense within the context of the container you are running them in. In other words, if you want to do `composer` things, you probably want to set up a `run` on your `php` service and not on your `node` cli container. These commands are run as you, so you cannot do `sudo-y` things. For that sort of thing, see [Steps Run As Root](#steps-run-as-root) below.

```yml
services:
  appserver:
    type: php:7.1
    run:
      - "cd $LANDO_MOUNT && composer install"
```

Steps Run As Root
-----------------

If you do not want to use your own custom image or Dockerfile via [Advanced Service Configuration](./advanced.md), we let you do some extra service construction steps after each service is started. **These will run directly after the container starts.**

**Please note** that these steps must make sense within the context of the container you are running them in. For example, you will not be able to run `dnf` inside of a `debian` flavored container.

Unlike [Build Steps](#build-steps), these commands are **ALL RUN AS ROOT**, so take care with what you do.

This is useful for adding in some additional dev tools you might prefer like `vim` or for adding in things like extra php extensions not installed by default.

```yml
services:
  appserver:
    type: php:7.1
    run_as_root:
      - "apt-get update -y"
      - "apt-get install netcat -y"
```
