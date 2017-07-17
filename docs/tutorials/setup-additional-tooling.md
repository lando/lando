Setting Up Additional Tooling
===

Lando allows you to set up additional tools in addition to the ones it comes with.  In this tutorial we will add a `git` tool.

Adding a `lando git` Command
--

* Add a `lando git` command to an existing git service inside the appserver container.
  * Existing service means the service in question in this case `git` is already installed on the container in question in this case the `appserver` container.


* Open the `.lando.yml` file for your app.

* If there is no `tooling` section of the yml file then add one.  If there is a `tooling` section add the new tooling command in this case `git` by adding the following lines:

```yml

    git:
      service: appserver

```

* Save the `.lando.yml` file.

* The new tool should show as an available command when you run: `lando`

```bash
Commands:
  composer                 Run composer commands
  config                   Display the lando configuration
  destroy [appname]        Destroy app in current directory or [appname]
  git                      Run git commands from inside the appserver container. For example 'lando git status'
  info [appname]           Prints info about app in current directory or [appname]
  init <appname> [method]  Initializes a lando app called <appname> with optional [method]
  list                     List all lando apps
  logs [appname]           Get logs for app in current directory or [appname]
  mysql                    Drop into a MySQL shell
  node                     Run node commands
  npm                      Run npm commands
  php                      Run php commands
  poweroff                 Spin down all lando related containers
  rebuild [appname]        Rebuilds app in current directory or [appname]
  restart [appname]        Restarts app in current directory or [appname]
  ssh [appname] [service]  SSH into [service] in current app directory or [appname]
  start [appname]          Start app in current directory or [appname]
  stop [appname]           Stops app in current directory or [appname]
  version                  Display the lando version
```

* To use the new command type: `lando git {someGitCommand}` where you would
replace `{someGitCommand}` with a specific command for example:

```bash
    `lando git status`
```

Further Reading
---
These steps show you how to add a `lando git` command to run inside one of
your services. To see the general docs on tooling here:
https://docs.lndo.io/config/tooling.html.

For more documentation on available `git` commands: https://git-scm.com/docs
