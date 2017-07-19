Setting Up Additional Tooling
===

Lando allows you to set up additional tools in addition to the ones it comes with.  In this tutorial we will add some tooling routes:
* To an existing service `lando git`
* To a build step service `lando phpunit`
* To a server installed service `lando phantomjs`

Existing Service: Adding a `lando git` Command
--

* Add a `lando git` command to an existing git service inside the appserver container.
  * Existing service means the service in question in this case `git` is already installed on the container in question in this case the `appserver` container.


* Open the `.lando.yml` file for your app.
* If there is no `tooling` section of the yml file then add one.  If there is a `tooling` section add the new tooling command in this case `git` by adding the following lines:

```yml
tooling:
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
--
These steps show you how to add a `lando git` command to run inside one of
your services. To see the general docs on tooling here:
https://docs.lndo.io/config/tooling.html.

For more documentation on available `git` commands: https://git-scm.com/docs

Build Step Service: Adding `lando phpunit` Command
---

The Git command was already installed on the appserver so we just had to add the lando route to it and it works! Here we will install `phpunit` that is not installed on the appserver and add a lando route to it so we can use it with `lando phpunit`.

* Open the `.lando.yml` file for your app.
* Add a `composer` section and get `phpunit` like so:

```yml
composer:
  phpunit/phpunit: '*'
```

* Add a build step that runs `composer install`:

```yml
build:
  - "cd $LANDO_MOUNT && composer install || true"
```

* Now to add a route add a `phpunit` key to the tooling section of `.lando.yml`:

```yml
tooling:
  phpunit:
    service: appserver
    description: "Run PHP Unit tests: lando phpunit"
```

Now the command `phpunit` is available in the list when typing: `lando` at your command prompt. The description key under the `phpunit` key will be the message in the help section that is optional but can be useful. To run `phpunit` now just type:

```bash
lando phpunit
```
Happy testing!

Server Installed Service: Adding `lando phantomjs` Command
---

We can add lando routes to server installed commands as well.  Here we will add a `lando phantomjs` command.

* Open the `.lando.yml` file for your app.
* We will intstall `phantomjs` on the appserver:
  * add and `extras` key to your `.lando.yml` file and add the commands to get the `phantomjs` dependencies and the `phantomjs` binary:

```yml
extras:
  - "apt-get update -y"
  - "apt-get install build-essential chrpath libssl-dev libxft-dev libfreetype6-dev libfreetype6 libfontconfig1-dev libfontconfig1 -y"
  - "wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2"
  - "tar xvjf phantomjs-2.1.1-linux-x86_64.tar.bz2 -C /usr/local/share/"
  - "ln -s /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/"
```
The `extras` section will issue these commands against the appserver. After adding the `extras` key you will need to restart lando in order to have it issue these commands against the container:

```bash
lando restart
```

* Now to add your `phantomjs` lando route to the `tooling` key in `.lando.yml`:

```yml
tooling:
  phantomjs:
    service: appserver
    description: "Run phantomjs commands"
```

Now you can run `phantomjs` commands trough lando! To test the installation issue this command at the command line:

```bash
lando phantomjs --version
```
Happy testing!
