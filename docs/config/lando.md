.lando.yml
==========

A `.lando.yml` file is at the heart of every Lando app. It is needed to tell Lando what things your app needs for development. It usually will contain the services and tools needed to run and develop your app. This file should live in the root directory of your app's code repository and ideally be tracked in its version control system.

If you make changes to your `.lando.yml` you will need to `lando restart` your app for those changes to be applied.

Basic config
------------

The most basic `.lando.yml` file contains two entries.

{% codesnippet "./../examples/trivial/.lando.yml" %}{% endcodesnippet %}

And can be run easily.

```bash
# Navigate to the directory with above .lando.yml
cd /path/to/app

# Start the app
lando start
```

> #### Hint::Images need to be pulled!
>
> The first time you start an app it *may* need to pull down container images. This can take a moment depending on your internet connection. Subsequent pulls to that container or service are cached so they should be much faster.

You can check out the full code for this example [over here.](https://github.com/lando/lando/tree/master/examples/trivial) Keep reading to learn about more powerful configuration options for `.lando.yml`.

The `recipe` Option
-------------------

If all you want to do is run a Docker Compose configuration, then the above example is for you. But Lando's real power is in its high-level abstractions with very little configuration.

Recipes offer the highest level of abstraction, composing many lower-level features of Lando into a single, top-level `recipe` option:

{% codesnippet "./../examples/envfile/.lando.yml" %}{% endcodesnippet %}

This is a working example you can run by following [these instructions](/config/recipes.html). It spins up a full LEMP stack out of the box.

The `config` Option
-------------------

Recipes are powerful by themselves, but recipe defaults won't always work for your application.

The top-level `config` option customizes specific aspects of a recipe. For example, the [Drupal 8](https://github.com/lando/lando/tree/master/examples/drupal8) recipe allows specifying the PHP version, the webserver, and even how to install `drush`:

{% codesnippet "./../examples/drupal8/.lando.yml" %}{% endcodesnippet %}

### The `conf` option

Within a `config` block, some recipes allow mounting custom language- or service-specific config files via the `conf` option:

```
config:
  conf:
    php: ./path/to/host/config/dir/php.ini
```

These can include:

* .ini files for PHP
* .conf files for Apache/Nginx
* config directories for MySQL/MariaDB/PostGres

Examples or recipes that support this include `drupal` (as illustrated above), [`wordpress`](https://github.com/lando/lando/blob/master/examples/wordpress/.lando.yml), and [`backdrop`](https://github.com/lando/lando/blob/master/examples/backdrop/.lando.yml). The `conf` option is also supported within individual `service` blocks for services that support it.

Fine-grained Configuration
--------------------------

Recipes are simply common development use-cases, composed of different combinations of [`services`](/config/services.html), [`tooling`](/config/tooling.html), [`proxies`](/config/proxiy.html), and [`events`](/config/events.html). Each of these is a first-class citizens in Lando, with its own top-level configuration options. They can run alongside  recipes or raw `compose` setups to extend functionality.

### Configuring `services`

The `services` block describes any number of single services, such as `php` and `mysql`. It always expects a `type` to specified. Other supported options within a service block depend on the type.

```yml
name: myapp
recipe: lamp

# Let's add a Redis cache service that our PHP service can talk to
services:
  cache:
    type: redis
```

Read more about [services](/config/services.html).

### Configuring `tooling`

The `tooling` block can define arbitrary `lando` commands, which map to arbitrary commands that run inside specific service containers. The key for each block becomes the name of the `lando` sub-command. For example, say you want to expose a CLI into your Redis service above. Just add this:

```yml
tooling:
  redis-cli:
    service: cache
```

Lando interprets this as "add a `lando redis-cli` subcommand that executes `redis-cli` inside the container running the `cache` service."

Read more about [tooling](/config/tooling.html).

### Configuring `proxy` domains

The `proxy` block defines custom domains for your services. **Lando does this automatically**, but by adding a `proxy` config you can map additional domains on your host machine to arbitrary services. To add a domain for a service called `myapp`, for example, simply add a `myapp` block with one or more domain names, defined as a YAML array:

```yml
proxy:
  myapp:
    - custom-name.lndo.site
    - another-name.lndo.site
```

This comes with several caveats, so be sure to read the [Proxy docs](/config/proxy.html) to understand the limitations.

### Configuring `events`

Lando apps expose a powerful event-based API. By defining a top-level `events` block, you can run arbitrary commands **before or after any supported event**.

The syntax is simple: `pre-eventname` and `post-eventname` blocks tell Lando to run extra commands before and after `eventname` fires, respectively. Individual event blocks are declared as YAML arrays. Within each array, the syntax for a single command tells Lando which to service to run it in. This means that one `post-` or `pre-` event block can declare any number of commands to be run **in separate services**:

```yml
services:
  tweeter:
    type: node

# Tell lando what to do after we run `lando autotweet`
events:
  post-autotweet
    - appserver: /path/to/tweeter-scraper.sh --with options
    - echo 'tweeter service is tweeting'

tooling:
  autotweet:
    service: tweeter
    cmd: "node autotweet.js --all-caps"
```

Lando determines which service to run the command in according to the following rules:

* If the command is defined in the form `SERVICENAME: CMD` where `SERVICENAME` is a service declared in the `services` block, the command is executed in that service.
* If the **event** name is a tooling command, the command is executed in the `service` declared in the tooling command block.
* If neither condition is met, Lando runs the command in `appserver`.

In the above example, `lando autotweet covfefe` results in the following, in this order:

* `node autotweet.js --all-caps covfefe` is run inside the `tweeter` service (as a normal tooling command)
* `/path/to/tweeter-scraper.sh --with options` is run inside `appserver` (because it was declared with the `appserver: ...` syntax)
* `echo 'tweeter service is tweeting'` is run inside the `tweeter` container (because `autotweet` is a tooling command for the `tweeter` service)

Read more about [events](/config/events.html)
