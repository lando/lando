# lando

![Lando](lando.jpg)

Installation
---

* `git clone git@github.com:kalabox/lando.git`
* `cd lando`
* `npm install`
* `ln -s {/path/to/lando/}bin/lando.js /usr/local/bin`

Running lando
---

* `lando`
  * Running just `lando` gives you a list of available commands:

```bash
geoff@yep ~ $ lando
Usage: /usr/local/bin/lando <command> [args] [options] [-- global options]

Commands:
  config             Display the lando configuration
  destroy [appname]  Destroy app in current directory or [appname]
  info [appname]     Prints info about app in current directory or [appname]
  list               List all lando apps
  poweroff           Spin down all lando related containers
  rebuild [appname]  Rebuilds app in current directory or [appname]
  restart [appname]  Restarts app in current directory or [appname]
  start [appname]    Start app in current directory or [appname]
  stop [appname]     Stops app in current directory or [appname]
  version            Display the lando version

Options:
  --help, -h  Show help                                                [boolean]

Global Options:
  --verbose, -v, -vv, -vvv, -vvvv  verbosity of output

You need at least one command before moving on
```
