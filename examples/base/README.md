Basics Example
==============

This example exists primarily to test the following documentation:

**Basics**

* [Landofiles](http://docs.devwithlando.io/config/lando.html)
* [Environment](http://docs.devwithlando.io/config/env.html)
* [SSH](http://docs.devwithlando.io/config/ssh.html)
* [Security](http://docs.devwithlando.io/config/security.html)
* [File Sharing](http://docs.devwithlando.io/config/files.html)

**CLI**

* [`lando config`](http://docs.devwithlando.io/cli/config.html)
* [`lando destroy`](http://docs.devwithlando.io/cli/destroy.html)
* [`lando info`](http://docs.devwithlando.io/cli/info.html)
* [`lando list`](http://docs.devwithlando.io/cli/list.html)
* [`lando logs`](http://docs.devwithlando.io/cli/logs.html)
* [`lando poweroff`](http://docs.devwithlando.io/cli/poweroff.html)
* [`lando info`](http://docs.devwithlando.io/cli/info.html)
* [`lando rebuild`](http://docs.devwithlando.io/cli/rebuild.html)
* [`lando restart`](http://docs.devwithlando.io/cli/restart.html)
* [`lando start`](http://docs.devwithlando.io/cli/start.html)
* [`lando stop`](http://docs.devwithlando.io/cli/stop.html)
* [`lando version`](http://docs.devwithlando.io/cli/version.html)

See the [Landofiles](http://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Start up the example
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Test 1
lando ssh -s web -c "true"
```

Destroy tests
-------------

```bash
# Destroy it
lando destroy -y
```
