Basics Example
==============

This example exists primarily to test the following documentation:

**Basics**

* [Landofiles](http://docs.lando.dev/config/lando.html)
* [Environment](http://docs.lando.dev/config/env.html)

**CLI**

* [CLI Usage](http://docs.lando.dev/basics/usage.html)
* [`lando config`](http://docs.lando.dev/basics/config.html)
* [`lando destroy`](http://docs.lando.dev/basics/destroy.html)
* [`lando info`](http://docs.lando.dev/basics/info.html)
* [`lando list`](http://docs.lando.dev/basics/list.html)
* [`lando logs`](http://docs.lando.dev/basics/logs.html)
* [`lando poweroff`](http://docs.lando.dev/basics/poweroff.html)
* [`lando info`](http://docs.lando.dev/basics/info.html)
* [`lando rebuild`](http://docs.lando.dev/basics/rebuild.html)
* [`lando restart`](http://docs.lando.dev/basics/restart.html)
* [`lando ssh`](http://docs.lando.dev/basics/ssh.html)
* [`lando start`](http://docs.lando.dev/basics/start.html)
* [`lando stop`](http://docs.lando.dev/basics/stop.html)
* [`lando version`](http://docs.lando.dev/basics/version.html)

See the [Landofiles](http://docs.lando.dev/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Should start successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should merge in all Landofiles correctly
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should merge in all Landofiles correctly even if we are down a directory
cd docker-compose
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1
cd ..

# Should load environment files from all Landofiles
lando ssh -s web -c "env" | grep "MILEY=CYRUS"
lando ssh -s web -c "env" | grep "TAYLOR=SWIFT"
lando ssh -s web -c "env" | grep "LOCAL=LANDO"

# Should load environment files from all Landofiles if we are down a directory
cd environment
lando ssh -s web -c "env" | grep "MILEY=CYRUS"
lando ssh -s web -c "env" | grep "TAYLOR=SWIFT"
lando ssh -s web -c "env" | grep "LOCAL=LANDO"
cd ..

# Should return lando help
lando config --help | grep verbose
lando config --lando | grep verbose

# Should return the version
lando version | grep "v3.1."

# Should run with specified verbosity
lando info -v | grep INFO
lando info -vv | grep VERBOSE
lando info -vvvv | grep SILLY

# Should run lando config without error
lando config

# Should only show specified field in lando config
lando config --path mode | grep cli
lando config -p mode | grep cli
lando config --field mode | grep cli
lando config --field mode | grep recipes || echo $? | grep 1

# Should output JSON in lando config without error
lando config --format json

# Should run lando info without error
lando info

# Should return docker inspect data
lando info -d | grep NetworkSettings
lando info --deep | grep NetworkSettings

# Should output JSON in lando info without error
lando info --format json

# Should return a specified path when given with lando info
lando info --path "[0]" | grep service | wc -l | grep 1

# Should list this apps containers
lando list | grep landobase_log_1
lando list | grep landobase_web_1
lando list | grep landobase_web2_1

# Should output JSON in lando list without error
lando list --format json

# Should return a specified path when given with lando list
lando list --path "landobase" | grep landobase

# Should return logs without error
lando logs

# Should return only logs for the specified service
lando logs -s web2 | grep log_1 || echo $? | grep 1
lando logs --service web2 | grep log_1 || echo $? | grep 1

# Should run a command as the LANDO_WEBROOT_USER by default
lando ssh -s web2 -c "id | grep \\\$LANDO_WEBROOT_USER"

# Should run a command as the user specific
lando ssh -s web2 -u root -c "id | grep root"

# Should stop the apps containers
lando stop
docker ps --filter label=com.docker.compose.project=landobase -q | wc -l | grep 0

# Should stop ALL running lando containers
lando start
docker ps --filter label=io.lando.container=TRUE -q | wc -l | grep 3
lando poweroff
docker ps --filter label=io.lando.container=TRUE -q | wc -l | grep 0

# Should rebuild the services without errors
lando rebuild -y
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should only rebuild the specified services
lando rebuild -y --service web2
lando rebuild -y -s web2
docker ps --latest | grep landobase_web2_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should restart the services without errors
lando restart
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should have non-numeric keys in LANDO_INFO
lando php info.php

# Should clear the lando tasks cache
lando version
lando --clear
ls -lsa ~/.lando/cache | grep _.tasks.cache || echo $? | grep 1

# Should not load the lando-alliance plugin when secret-toggle is on and packaged
lando config | grep "disablePlugins" | grep "lando-alliance"

# Should not allow the secret toggle when run packaged
lando --secret-toggle || echo $? | grep 1

# Should set the release channel as stable by default
lando config | grep "channel" | grep "stable"

# Should set the release channel based on the user option
lando --channel edge
lando config | grep "channel" | grep "edge"
lando --channel stable
lando config | grep "channel" | grep "stable"

# Should not allow bogus relase channels
lando --channel orange || echo $? | grep 1

# Should load experimental plugins by default in CI
lando config | grep experimentalPluginLoadTest | grep true

# Should load plugins from pluginDirs
lando stuff | grep "I WORKED"
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff
```
