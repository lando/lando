Working with MEAN
=================

Lando offers a configurable recipe for spinning up apps that use the [MEAN](https://mean.io) stack, a common set of infrastructure designed to run NodeJS applications.

Let's go over some basic usage.

<!-- toc -->

Getting Started
---------------

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../installation/system-requirements.md)
2. [Read up on how to get a `.lando.yml`](./../started.md)

If after reading #2 above you are still unclear how to get started then try this

```bash
# Go into a local folder with your site or app codebase
# You can get this via git clone or from an archive
cd /path/to/my/codebase

# Initialize a basic .lando.yml file for my recipe with sane defaults
lando init

# Commit the .lando.yml to your git repo (Optional but recommended)
git add -A
git commit -m "Adding Lando configuration file for easy and fun local development!"
git push
```

For more info on how `lando init` works check out [this](./../cli/init.md).

Starting Your Site
------------------

Once you've completed the above you should be able to start your MEAN site.

```bash
# Install dependencies your app needs to run
lando npm install || lando yarn install

# Start up app
lando start
```

If you visit any of the green-listed URLS that show up afterwards you should be presented with whatever content is loaded by the `main` script in your `package.json`.

Tooling
-------

Each MEAN recipe will also ship with some helpful `node` dev utilities. This means you can use things like `node` and `npm` via Lando and avoid mucking up your actual computer trying to manage `node` versions and global `npm` tooling.

If you are interested in installing other helpful global `node` commands like `bower` or `gulp` we recommend you read our [Setting up front end tooling guide](./../tutorials/frontend.md).

```bash
lando mongo                    Drop into the mongo shell
lando node                     Run node commands
lando npm                      Run npm commands
lando yarn                     Run yarn commands
```

```bash
# Drop into a mongo shell
lando mongo

# Install the redis module
lando npm install redis --save

# Install wahts in my package.json with yarn
lando yarn install

# Run a node command
lando node -e "console.log('hi');"
```

You can also run `lando` from inside your app directory for a complete list of commands.

Configuration
-------------

### Recipe

You can also manually configure the `.lando.yml` file to switch `node` or `mongo` versions, set a custom `command` besides `npm start` to run when you start your app or to use a custom `mongo` config file.

{% codesnippet "./../examples/mean/.lando.yml" %}{% endcodesnippet %}

You will need to rebuild your app with `lando rebuild` to apply the changes to this file. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mean).

### Environment Variables

The below are in addition to the [default variables](./../config/services.md#environment) that we inject into every container.

```bash
# The below is a specific example to ILLUSTRATE the KINDS of things provided by this variable
# The content of your variable may differ
LANDO_INFO={"appserver":{"type":"node","version":"8.0","hostnames":["appserver"]},"database":{"type":"mongo","version":"3.2","hostnames":["database"],"internal_connection":{"host":"database","port":27017},"external_connection":{"host":"localhost","port":true}}}
```

**NOTE:** These can vary based on the choices you make in your recipe config.
**NOTE:** See [this tutorial](./../tutorials/lando-info.md) for more information on how to properly use `$LANDO_INFO`.

### Automation

You can take advantage of Lando's [events framework](./../config/events.md) to automate common tasks. Here are some useful examples you can drop in your `.lando.yml` to make your MEAN app super slick.

```yml
events:

  # Runs yarn install after you start your app
  post-start:
    - appserver: cd $LANDO_MOUNT && yarn install

```

Advanced Service Usage
----------------------

You can get more in-depth information about the services this recipe provides by running `lando info`.

Read More
---------

### Workflow Docs

*   [Using Composer to Manage a Project](http://docs.devwithlando.io/tutorials/composer-tutorial.html)
*   [Lando and CI](http://docs.devwithlando.io/tutorials/lando-and-ci.html)
*   [Lando, Pantheon, CI, and Behat (BDD)](http://docs.devwithlando.io/tutorials/lando-pantheon-workflow.html)
*   [Killer D8 Workflow with Platform.sh](https://thinktandem.io/blog/2017/10/23/killer-d8-workflow-using-lando-and-platform-sh/)

### Advanced Usage

*   [Adding additional services](http://docs.devwithlando.io/tutorials/setup-additional-services.html)
*   [Adding additional tooling](http://docs.devwithlando.io/tutorials/setup-additional-tooling.html)
*   [Adding additional routes](http://docs.devwithlando.io/config/proxy.html)
*   [Adding additional events](http://docs.devwithlando.io/config/events.html)
*   [Setting up front end tooling](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Accessing services (eg your database) from the host](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Importing SQL databases](http://docs.devwithlando.io/tutorials/db-import.html)
*   [Exporting SQL databases](http://docs.devwithlando.io/tutorials/db-export.html)
