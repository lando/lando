Events
======

Events allow you to fine-tune your Lando experience by running commands on specific services before or after parts of the Lando runtime. This is super helpful if you want to clear caches after a database import, or compile `sass` after an app is started.

Specifically, you need to hook into an event where the service you are running the command against exists and is running.

Usage
-----

Consider the following example to get an understanding on how the events framework works.

{% codesnippet "./../examples/events/.lando.yml" %}{% endcodesnippet %}

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
