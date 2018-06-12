## Basics

*   [Overview](README.md)
*   [Getting Started](started.md)

## Installation

*   [System Requirements](installation/system-requirements.md)
*   [Preflight Checks](installation/preflight.md)
*   [Installing](installation/installing.md)
*   [Updating](installation/updating.md)
*   [Uninstalling](installation/uninstalling.md)

## Recipes

*   [Backdrop](tutorials/backdrop.md)
*   [Dotnet](services/dotnet.md)
*   [Drupal 6](tutorials/drupal6.md)
*   [Drupal 7](tutorials/drupal7.md)
*   [Drupal 8](tutorials/drupal8.md)
*   [Go](services/go.md)
*   [Joomla](tutorials/joomla.md)
*   [Laravel](tutorials/laravel.md)
*   [LAMP](tutorials/lamp.md)
*   [LEMP](tutorials/lemp.md)
*   [MEAN](tutorials/mean.md)
*   [Pantheon](tutorials/pantheon.md)
*   [Python](services/python.md)
*   [Ruby](services/ruby.md)
*   [WordPress](tutorials/wordpress.md)
*   [Custom](tutorials/custom.md)

## Services

*   [apache](services/apache.md)
*   [compose](services/compose.md)
*   [dotnet](services/dotnet.md)
*   [elasticsearch](services/elasticsearch.md)
*   [go](services/go.md)
*   [mailhog](services/mailhog.md)
*   [mariadb](services/mariadb.md)
*   [memcached](services/memcached.md)
*   [mongo](services/mongo.md)
*   [mssql](services/mssql.md)
*   [mysql](services/mysql.md)
*   [nginx](services/nginx.md)
*   [node](services/node.md)
*   [php](services/php.md)
*   [phpmyadmin](services/phpmyadmin.md)
*   [postgres](services/postgres.md)
*   [python](services/python.md)
*   [redis](services/redis.md)
*   [ruby](services/ruby.md)
*   [solr](services/solr.md)
*   [tomcat](services/tomcat.md)
*   [varnish](services/varnish.md)

## Command Line

*   [Usage](cli/usage.md)
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
*   [Running behind a firewall](issues/firewall.md)
*   [Running behind a proxy](issues/proxy.md)
*   [Switching Database Config](issues/switching-dbs.md)
*   [Overlapping IPv4 Address](issues/overlapping-ip.md)

## Troubleshooting and Support

*   [Accessing Logs](troubleshooting/logs.md)
*   [Using Lando with Kalabox](troubleshooting/wkbox.md)
*   [Reporting Issues](https://github.com/lando/lando/issues)
*   [Slack Channel](https://slackpass.io/kalabox)

## Workflow Docs

*   [Using Composer to Manage a Project](tutorials/composer-tutorial.md)
*   [Lando and CI](tutorials/lando-and-ci.md)
*   [Lando, Pantheon, CI, and Behat (BDD)](tutorials/lando-pantheon-workflow.md)
*   [Killer D8 Workflow with Platform.sh](https://thinktandem.io/blog/2017/10/23/killer-d8-workflow-using-lando-and-platform-sh/)

## Advanced Usage

*   [Setting up Additional Services](tutorials/setup-additional-services.md)
*   [Setting up Additional Tooling](tutorials/setup-additional-tooling.md)
*   [Setting up Additional Routes](config/proxy.md)
*   [Setting up Additional Events](config/events.md)
*   [Using Lando in Visual Studio Code](tutorials/lando-with-vscode.md)
*   [Using NodeJS Frontend Tooling](tutorials/frontend.md)
*   [Using $LANDO_INFO](tutorials/lando-info.md)
*   [Accessing Your Services Externally](tutorials/external-access.md)
*   [Accessing Lando from Other Devices](tutorials/access-by-other-devices.md)
*   [Importing Databases](tutorials/db-import.md)
*   [Exporting Databases](tutorials/db-export.md)
*   [Offline Development](tutorials/offline-dev.md)
*   [Reasons to climb a mountain](https://www.youtube.com/watch?v=tkBVDh7my9Q)

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

## API

*   [Core](api/core.md)
  *   [lando](api/core.md#lando)
  *   [events.pre-bootstrap](api/core.md#event_pre_bootstrap)
  *   [events.post-bootstrap](api/core.md#event_post_bootstrap)
  *   [lando.cache.set](api/core.md#landocacheset)
  *   [lando.cache.get](api/core.md#landocacheget)
  *   [lando.cache.remove](api/core.md#landocacheremove)
  *   [lando.cli.argv](api/core.md#landocliargv)
  *   [lando.cli.checkPerms](api/core.md#landoclicheckperms)
  *   [lando.cli.defaultConfig](api/core.md#landoclidefaultconfig)
  *   [lando.cli.largv](api/core.md#landoclilargv)
  *   [lando.cli.makeArt](api/core.md#landoclimakeart)
  *   [lando.cli.makeTable](api/core.md#landoclimaketable)
  *   [lando.cli.parseToYargs](api/core.md#landocliparsetoyargs)
  *   [events.pre-cli-load](api/core.md#event_pre_cli_load)
  *   [lando.error.handle](api/core.md#landoerrorhandle)
  *   [lando.events.emit](api/core.md#landoeventsemit)
  *   [lando.events.on](api/core.md#landoeventson)
  *   [lando.log.debug](api/core.md#landologdebug)
  *   [lando.log.error](api/core.md#landologerror)
  *   [lando.log.info](api/core.md#landologinfo)
  *   [lando.log.silly](api/core.md#landologsilly)
  *   [lando.log.verbose](api/core.md#landologverbose)
  *   [lando.log.warn](api/core.md#landologwarn)
  *   [lando.node._](api/core.md#landonode_)
  *   [lando.node.chalk](api/core.md#landonodechalk)
  *   [lando.node.fs](api/core.md#landonodefs)
  *   [lando.node.hasher](api/core.md#landonodehasher)
  *   [lando.node.ip](api/core.md#landonodeip)
  *   [lando.node.jsonfile](api/core.md#landonodejsonfile)
  *   [lando.node.rest](api/core.md#landonoderest)
  *   [lando.node.semver](api/core.md#landonodesemver)
  *   [lando.plugins.load](api/core.md#landopluginsload)
  *   [lando.Promise](api/core.md#landopromise)
  *   [lando.Promise.retry](api/core.md#landopromiseretry)
  *   [lando.scanUrls](api/core.md#landoscanurls)
  *   [lando.shell.esc](api/core.md#landoshellesc)
  *   [lando.shell.escSpaces](api/core.md#landoshellescspaces)
  *   [lando.shell.sh](api/core.md#landoshellsh)
  *   [lando.shell.which](api/core.md#landoshellwhich)
  *   [lando.tasks.add](api/core.md#landotasksadd)
  *   [lando.tasks.tasks](api/core.md#landotaskstasks)
  *   [lando.updates.updateAvailable](api/core.md#landoupdatesupdateavailable)
  *   [lando.updates.fetch](api/core.md#landoupdatesfetch)
  *   [lando.updates.refresh](api/core.md#landoupdatesrefresh)
  *   [lando.user.getGid](api/core.md#landousergetgid)
  *   [lando.user.getUid](api/core.md#landousergetuid)
  *   [lando.yaml.dump](api/core.md#landoyamldump)
  *   [lando.yaml.load](api/core.md#landoyamlload)
  *   [events.task-CMD-answers](api/core.md#event_task_cmd_answers)
  *   [events.task-CMD-run](api/core.md#event_task_cmd_run)

## Changelog

*   [2018](changelog/2018.md)
*   [2017](changelog/2017.md)
