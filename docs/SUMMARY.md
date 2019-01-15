## Basics

*   [Overview](README.md)
*   [Core Concepts](started.md)
*   [CLI Usage](cli/usage.md)

## Installation

*   [System Requirements](installation/system-requirements.md)
*   [Preflight Checks](installation/preflight.md)
*   [MacOS](installation/macos.md)
*   [Linux](installation/linux.md)
*   [Windows](installation/windows.md)
*   [From Source](installation/source.md)
*   [Updating](installation/updating.md)
*   [Uninstalling](installation/uninstalling.md)

## Command Line

*   [config](cli/config.md)
*   [destroy](cli/destroy.md)
*   [init](cli/init.md)
*   [info](cli/info.md)
*   [list](cli/list.md)
*   [logs](cli/logs.md)
*   [poweroff](cli/poweroff.md)
*   [rebuild](cli/rebuild.md)
*   [restart](cli/restart.md)
*   [share](cli/share.md)
*   [ssh](cli/ssh.md)
*   [start](cli/start.md)
*   [stop](cli/stop.md)
*   [version](cli/version.md)

## Known Issues

*   [DNS Rebinding Protection](issues/dns-rebind.md)
*   [File Uploads on Windows](issues/win-file-upload.md)
*   [File Syncing Stalled](issues/file-sync.md)
*   [Running VB and HyperV](issues/win-also-vb.md)
*   [Running behind a proxy](issues/proxy.md)
*   [Switching Database Config](issues/switching-dbs.md)

## Troubleshooting and Support

*   [Accessing Logs](troubleshooting/logs.md)
*   [Using Lando with Kalabox](troubleshooting/wkbox.md)
*   [Reporting Issues](https://github.com/lando/lando/issues)
*   [Slack Channel](https://slackpass.io/kalabox)

## Configuration

*   [.lando.yml](config/lando.md)
*   [Recipes](config/recipes.md)
*   [Events](config/events.md)
*   [Proxy](config/proxy.md)
*   [Services](config/services.md)
*   [Tooling](config/tooling.md)
*   [config.yml](config/config.md)
*   [Environment](config/env.md)
*   [Networking](config/networking.md)
*   [SSH Keys](config/ssh.md)
*   [SSL/TLS](config/security.md)
*   [Shared Files](config/files.md)
*   [Build Steps](config/build.md)
*   [Scripting](config/scripting.md)
*   [Advanced](config/advanced.md)

## Community

*   [Slidedecks](https://drive.google.com/drive/folders/1ooK_NTMBuwOV0uix8O54umJGwAODL9dC)

## Contributing

*   [Overview](contrib/contributing.md)
*   [Project Vision](contrib/vision.md)
*   [How to Contribute](contrib/how.md)
*   [Governance](contrib/gov.md)
*   [Roles and Responsibilities](contrib/roles.md)
*   [Security](contrib/security.md)
*   [Resources](contrib/resources.md)

## Developing

*   [Getting Started](dev/started.md)
*   [Repo Structure](dev/structure.md)
*   [Plugins](dev/plugins.md)
  *   [Services](dev/services.md)
  *   [Recipes](dev/recipes.md)
*   [Testing](dev/testing.md)
*   [Building](dev/building.md)
*   [Shipping](dev/shipping.md)
*   [Documentation](dev/docs.md)

## Lando API

*   [Lando](api/lando.md#lando)
*   [lando.bootstrap](api/lando.md#landobootstrap)
*   [lando.cache.get](api/cache.md#landocacheget)
*   [lando.cache.set](api/cache.md#landocacheset)
*   [lando.cache.remove](api/cache.md#landocacheremove)
*   [lando.engine.build](api/engine.md#landoenginebuild)
*   [lando.engine.createNetwork](api/engine.md#landoenginecreateNetwork)
*   [lando.engine.destroy](api/engine.md#landoenginedestroy)
*   [lando.engine.exists](api/engine.md#landoengineexists)
*   [lando.engine.getNetwork](api/engine.md#landoenginegetnetwork)
*   [lando.engine.getNetworks](api/engine.md#landoenginegetnetworks)
*   [lando.engine.isRunning](api/engine.md#landoengineisrunning)
*   [lando.engine.list](api/engine.md#landoenginelist)
*   [lando.engine.logs](api/engine.md#landoenginelogs)
*   [lando.engine.run](api/engine.md#landoenginerun)
*   [lando.engine.scan](api/engine.md#landoenginescan)
*   [lando.engine.start](api/engine.md#landoenginestart)
*   [lando.engine.stop](api/engine.md#landoenginestop)
*   [lando.events.emit](api/events.md#landoeventsemit)
*   [lando.events.on](api/events.md#landoeventson)
*   [lando.error.handle](api/error.md#landoerrorhandle)
*   [lando.getApp](api/lando.md#landogetapp)
*   [lando.log.debug](api/log.md#landologdebug)
*   [lando.log.error](api/log.md#landologerror)
*   [lando.log.info](api/log.md#landologinfo)
*   [lando.log.silly](api/log.md#landologsilly)
*   [lando.log.verbose](api/log.md#landologverbose)
*   [lando.log.warn](api/log.md#landologwarn)
*   [lando.plugins.find](api/plugins.md#landopluginsfind)
*   [lando.plugins.load](api/plugins.md#landopluginsload)
*   [lando.Promise](api/promise.md#landopromise)
*   [lando.Promise.retry](api/promise.md#landopromiseretry)
*   [lando.scanUrls](api/scan.md#landoscanurls)
*   [lando.shell.sh](api/shell.md#landoshellsh)
*   [lando.shell.which](api/shell.md#landoshellwhich)
*   [lando.updates.fetch](api/updates.md#landoupdatesfetch)
*   [lando.updates.refresh](api/updates.md#landoupdatesrefresh)
*   [lando.updates.updatesAvailable](api/updates.md#landoupdatesupdatesavailable)
*   [lando.user.getGid](api/user.md#landousergetgid)
*   [lando.user.getUid](api/user.md#landousergetuid)
*   [lando.yaml.dump](api/yaml.md#landoyamldump)
*   [lando.yaml.load](api/yaml.md#landoyamlload)

## Lando Events

*   [pre-bootstrap-config](api/lando.md#event_pre_bootstrap_config)
*   [pre-bootstrap-tasks](api/lando.md#event_pre_bootstrap_tasks)
*   [pre-bootstrap-engine](api/lando.md#event_pre_bootstrap_engine)
*   [pre-bootstrap-app](api/lando.md#event_pre_bootstrap_app)
*   [post-bootstrap-config](api/lando.md#event_post_bootstrap_config)
*   [post-bootstrap-tasks](api/lando.md#event_post_bootstrap_tasks)
*   [post-bootstrap-engine](api/lando.md#event_post_bootstrap_engine)
*   [post-bootstrap-app](api/lando.md#event_post_bootstrap_app)
*   [pre-engine-build](api/engine.md#event_pre_engine_build)
*   [post-engine-build](api/engine.md#event_post_engine_build)
*   [pre-engine-destroy](api/engine.md#event_pre_engine_destroy)
*   [post-engine-destroy](api/engine.md#event_post_engine_destroy)
*   [pre-engine-run](api/engine.md#event_pre_engine_run)
*   [post-engine-run](api/engine.md#event_post_engine_run)
*   [pre-engine-start](api/engine.md#event_pre_engine_start)
*   [post-engine-start](api/engine.md#event_post_engine_start)
*   [pre-engine-stop](api/engine.md#event_pre_engine_stop)
*   [post-engine-stop](api/engine.md#event_post_engine_stop)

## App API

*   [app.config](api/app.md#appconfig)
*   [app.destroy](api/app.md#appdestroy)
*   [app.events](api/app.md#appevents)
*   [app.init](api/app.md#appinit)
*   [app.info](api/app.md#appinfo)
*   [app.name](api/app.md#appname)
*   [app.rebuild](api/app.md#apprebuild)
*   [app.restart](api/app.md#apprestart)
*   [app.root](api/app.md#approot)
*   [app.start](api/app.md#appstart)
*   [app.stop](api/app.md#appstop)
*   [app.uninstall](api/app.md#appuninstall)

## App Events

*   [pre-destroy](api/app.md#event_pre_destroy)
*   [post-destroy](api/app.md#event_post_destroy)
*   [pre-init](api/app.md#event_pre_init)
*   [post-init](api/app.md#event_post_init)
*   [pre-rebuild](api/app.md#event_pre_rebuild)
*   [post-rebuild](api/app.md#event_post_rebuild)
*   [pre-restart](api/app.md#event_pre_restart)
*   [post-restart](api/app.md#event_post_restart)
*   [pre-start](api/app.md#event_pre_start)
*   [post-start](api/app.md#event_post_start)
*   [pre-stop](api/app.md#event_pre_stop)
*   [post-stop](api/app.md#event_post_stop)
*   [pre-uninstall](api/app.md#event_pre_uninstall)
*   [post-uninstall](api/app.md#event_post_uninstall)
*   [ready](api/app.md#event_ready)

## Changelog

*   [2019](changelog/2019.md)
*   [2018](changelog/2018.md)
*   [2017](changelog/2017.md)

## Jobs!

*   [Full Stack Drupal Dev](jobs/2018-full-stack-dev.md)
