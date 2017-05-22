!!! warning "Looking for pre-made Drupal, Wordpress and Backdrop apps?"
    If you aren't interested in making your own apps, check out the documentation on...

    * [Our Pantheon plugin](http://pantheon.kalabox.io) - Allows you to pull Drupal, Wordpress and Backdrop sites from Pantheon
    * [Our PHP plugin](http://php.kalabox.io) - Allows you to spin up brand-new Drupal, Wordpress, and Backdrop sites.

Getting Started
===============

Now that you've [successfully installed](./install.md) Kalabox you can start creating your own apps. Kalabox apps are completely isolated development environments. At a high level they contain the following things:

  1. Metadata about the containers and services your application needs to run.
  2. Metadata about the tooling your application needs for development.
  3. High level configuration such as name, service exposure, file sharing, etc.
  4. Your application’s codebase.

!!! note "Apps are mutually exclusive"
    This architecture means that everything you need to run and develop your app is contained within the app itself. That means you can blow away `app1` without it having any impact on the containers and tools you are using on `app2`.

Kalabox Apps
------------

Kalabox apps can be quite simple or massively complex. For example, a Kalabox app can be a static HTML site, or can mimic and integrate with hosting providers like Pantheon.

A Kalabox app at it's smallest requires only two files:

  1. A `kalabox.yml` file that contains the high level configuration for your app.
  2. A `kalabox-compose.yml` file that contains the services your app needs to run.

!!! tip "Kalabox uses Docker Compose"
    The `kalabox-compose` file is simply a [Docker Compose](https://docs.docker.com/compose/compose-file/) file.

Let's look at a few examples.

Example 1: Static HTML site
---------------------------

You can find the code for this example over [here](https://github.com/kalabox/kalabox-app-examples/tree/master/html1). Let's clone the repo and then start up the app.

```bash
git clone https://github.com/kalabox/kalabox-app-examples && cd kalabox-app-examples/html1
kbox start
```

Now that you've started up the app you should have...

  1. A static HTML site running the latest `nginx` and accessible at `http://html1.example.kbox.site/`
  2. A webroot with the default `nginx` index.html inside your app in the `code` directory.

!!! tip "File sharing"
    Everything in your apps `code` directory should be synced to the web server. Try editing `index.html` and refreshing your site to see all the magix.

Now let examine your app's directory structure and files.

#### Directory structure

```
.
|-- kalabox.yml
|-- kalabox-compose.yml
```

#### Files

**kalabox.yml**

Let's examine the basic config options here:

```yaml
name: html1.example
type: example
version: 0.13.0-alpha.1
pluginconfig:
  sharing:
    share: 'web:/usr/share/nginx/html'
  services:
    web:
      - port: 80/tcp
        default: true
```

* **name** - Tells Kalabox the name of the app
* **type** - Tells Kalabox the type of the app
* **version** - Tells Kalabox the version of the app
* **pluginconfig** - Tells Kalabox how this apps sharing and services plugins should be configured. [Read more](./config.md) about that here.

**kalabox-compose.yml**

This is a simple `docker-compose` file that tells Kalabox to spin up a container called `examplehtml1_web_1`, which should be built using the latest official image of `nginx` and whose port `80` should be exposed to the outside world so we can communicate with it. It also sets the containers hostname based on the environmental variable `$KALABOX_APP_HOSTNAME`. Read more about that in the tip below.

```yaml
web:
  image: nginx:latest
  hostname: $KALABOX_APP_HOSTNAME
  ports:
    - "80"
```

!!! tip "PRO TIP: Level up your `kalabox-compose.yml`"
    You can use variables found in `kbox env` when constructing your `kalabox-compose.yml` such as `$KALABOX_APP_HOSTNAME`. This can give you a lot of power and flexibility when crafting your app.


