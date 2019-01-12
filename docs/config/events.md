Events
======

Events allow you to fine-tune your Lando experience by running commands on specific services before or after parts of the Lando runtime. This is super helpful if you want to clear caches after a database import, or compile `sass` after an app is started.

Specifically, you need to hook into an event where the service you are running the command against exists and is running.

> #### Hint::When should I use events?
>
> Unlike [build steps](./build.md) `events` will run **every time** so it is advisable to use them for automating common steps like compiling `sass` before or after your app starts and not installing lower level dependencies like `node modules` or `php extensions`.

Usage
-----

Consider the following example to get an understanding on how the events framework works.


You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/events).

Discovering Events
------------------

You can also explore various events by running:

```bash
# Discover hookable events for the `lando start` command
lando start -- -vvv | grep "Emitting"

# Discover hookable events for the `lando test` command
# NOTE: This assumed you've defined a `test` command in tooling
lando test -- -vvv | grep "Emitting"
```
