Setting Up Additional Tooling
=============================

Lando allows you to set up additional tools in addition to the ones it comes with.  In this tutorial we will add some tooling routes:

*   To an existing service `lando git`
*   To a build step service `lando phpunit`
*   To a server installed service `lando phantomjs`

Existing Service: Adding a `lando git` Command
----------------------------------------------

Add a `lando git` command to an existing git service inside the appserver container. Existing service means the service in question in this case `git` is already installed on the container in question in this case the `appserver` container. You can verify this is the case by running `lando ssh appserver -c "git"`.

Open the `.lando.yml` file for your app. If there is no `tooling` section of the yml file then add one. If there is a `tooling` section add the new tooling command in this case `git` by adding the following lines:

```yml
tooling:
  git:
    service: appserver
```

Save the `.lando.yml` file. The new tool should show as an available command when you run: `lando`.

```yaml
Commands:
  composer                 Run composer commands
  config                   Display the lando configuration
  destroy [appname]        Destroy app in current directory or [appname]
  git                      Run git commands from inside the appserver container. For example lando git status
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

To use the new command type: `lando git {someGitCommand}` where you would replace `{someGitCommand}` with a specific command for example:

```bash
lando git status
```

### Further Reading

These steps show you how to add a `lando git` command to run inside one of your services. To see the general docs on tooling [click here](https://docs.devwithlando.io/config/tooling.html)

For more documentation on available `git` commands [click here](https://git-scm.com/docs).

Build Step Service: Adding `lando phpunit` Command
--------------------------------------------------

The Git command was already installed on the appserver, so we just had to add the lando route to it and it works! Here we will install `phpunit` that is not installed on the appserver and add a lando route to it so we can use it via the a convenient `lando phpunit` command.

Open the `.lando.yml` file for your app. Add a `composer` section to your `appserver` to get `phpunit` like so:

```yml
services:
  appserver:
    composer:
      phpunit/phpunit: '*'
```

Alternatively, you could add `phpunit` to your app's `composer.json` and tell `lando` to run `composer install`.

```yml
services:
  appserver:
    run:
      - "cd $LANDO_MOUNT && composer install"
```

Either of these things need to happen on a `php` type service. You can read more about that [here](./../services/php.md). Finally, add a `phpunit` key to the tooling section of `.lando.yml`. And `lando restart` or `lando rebuild` to install the new stuff.

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
----------------------------------------------------------

We can add lando routes to server installed commands as well.  Here we will add a `lando phantomjs` command.

Open the `.lando.yml` file for your app add an [`run_as_root`](./../config/build.md#steps-run-as-root) key to the `appserver` in your `.lando.yml` file and add the commands to get the `phantomjs` dependencies and the `phantomjs` binary:

```yml
services:
  appserver:
    run_as_root:
      - "apt-get update -y"
      - "apt-get install build-essential chrpath libssl-dev libxft-dev libfreetype6-dev libfreetype6 libfontconfig1-dev libfontconfig1 -y"
      - "wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2"
      - "tar xvjf phantomjs-2.1.1-linux-x86_64.tar.bz2 -C /usr/local/share/"
      - "ln -s /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/"
```

The [`run_as_root`](./../config/build.md#steps-run-as-root) section will issue these commands against the appserver. Note that [`run_as_root`](./../config/build.md#steps-run-as-root) will run as `root` while `build` will run as you. You can read more about that [here](https://docs.devwithlando.io/config/services.html#build-steps). After adding the [`run_as_root`](./../config/build.md#steps-run-as-root) key you will need to restart your app in order to have it issue these commands against the container.

```bash
lando restart
```

Now to add your `phantomjs` lando route to the `tooling` key in `.lando.yml`:

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

Multi-Service Tooling With Events
---------------------------------

Tooling can only run on one service, but if you want to create more complex workflows that require multiple services, you can do that by adding an [`events`](./../config/events.md) section to your `.lando.yml` file. For example, let’s say you want to add a `lando update` command which updates local dependencies using Composer, compiles SASS using Gulp, and then runs Drupal database updates.

First add a Node service to your app:

```yml
services:
  node:
    type: node:6.10
    globals:
      gulp-cli: "latest"
 ```

Next you can add your `update` command to the tooling, but it doesn’t actually have to do much of anything. Let’s just have it echo some text:

```yml
tooling:
  update:
    service: appserver
    description: "Builds local dependencies, compiles SASS, runs DB updates"
    cmd: echo Updating your local dependencies and database…
```

Now here’s the fun part, in the `events` section you can add a series of commands along with the service they should run on:

```yml
events:
  post-update:
    - appserver: cd $LANDO_MOUNT && composer install
    - node: cd $LANDO_MOUNT && gulp
    - appserver: cd $LANDO_WEBROOT && drush updb -y
```
