Tooling
=======

Lando provides a way to easily define nice `lando MYCOMMAND` commands so that users can take advantage of development tools that are installed inside of containers. Setting up some common routes for things like `composer` or `npm` allows the user to get a "native" experience but perhaps more importantly allows project specific development dependencies to be isolated and run in containers instead of on the user's host machine. You never need to worry about which version of `php` or `grunt` you need for each project.

You can think of tooling configuration as a nice way to alias a superset of commands that would otherwise need to be run as something like `lando ssh -c "composer install"`.

> #### Warning::Make sure to install your dependencies
>
> You will want to make sure you install the tools you need inside of the services your app is running. If you are not clear on how to do this, check out either [build steps](./../config/services.md#build-extras) or our [`ssh`](./../cli/ssh.md) command.

Example
-------

{% codesnippet "./../examples/trivial-tooling/.lando.yml" %}{% endcodesnippet %}

You can see the extra commands by running `lando` inside your app.

```bash
lando

Usage: lando <command> [args] [options] [-- global options]

Commands:
  config                   Display the lando configuration
  destroy [appname]        Destroy app in current directory or [appname]
  info [appname]           Prints info about app in current directory or [appname]
  init <appname> [method]  Initializes a lando app called <appname> with optional [method]
  list                     List all lando apps
  logs [appname]           Get logs for in current directory or [appname]
  poweroff                 Spin down all lando related containers
  rebuild [appname]        Rebuilds app in current directory or [appname]
  restart [appname]        Restarts app in current directory or [appname]
  ssh [appname] [service]  SSH into [service] in current app directory or [appname]
  start [appname]          Start app in current directory or [appname]
  stop [appname]           Stops app in current directory or [appname]
  version                  Display the lando version
  composer                 Run composer commands
  php                      Run php commands
  mysql                    Drop into a MySQL shell

Global Options:
  --help, -h  Show help
  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output

You need at least one command before moving on
```

Overriding
----------

You can override tooling provided by Lando by redefining the tooling options in your `.lando.yml` file. For example, if you wanted to override the built in `drush` command that comes with Drupaly recipes so that it always runs in a specific directory you could do the below.

```yml
tooling:
  drush:
    cmd:
      - "drush"
      - "--root=/app/web"
```

Disabling
---------

You can also disable built in tooling by setting the command to a non-object value in your `.lando.yml` file. While any value will do it's convention to use `disabled` as in the below.

```yml
tooling:
  push: disabled
```

Directory Mapping
-----------------

Lando will try to map your host directory to the analogous directory inside the service. This should **MAKE IT SEEM** as though you are running the command locally.

Tool Discovery
--------------

If you are not sure about what tools live inside your container, you can use `lando ssh` to drop into a shell on a specific service to both investigate and install any needed dependencies.

```bash
# SSH into the appserver
lando ssh appserver

# Explore whether grunt is installed
which grunt
  # not installed

# Add grunt
npm install -g grunt-cli

# Exit the appserver container
exit

# Add grunt to the tooling in your .lando.yml
```

While you can do the above, it's generally recommended to install any additional dependencies as part of the build process either using specific dependency management built into the service you are using or with Lando's more generic [build step process](./../config/services.md#build-extras).
