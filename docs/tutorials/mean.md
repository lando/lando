Working with MEAN
=================

Lando offers a [configurable recipe](./../recipes/mean.md) for spinning up apps that use the [MEAN](https://mean.io) stack, a common set of infrastructure designed to run NodeJS applications.

Let's go over some basic usage.

<!-- toc -->

Getting Started
---------------

Before you can use all the awesome MEAN Lando magic you need a codebase with a `.lando.yml` file in its root directory. There are a few ways you can do this...

### 1. Start with an existing codebase

```bash
# Clone codebase from git, un-tar codebase, receive as gift from the gods, etc.
git clone https://private-repository.com/mean-project.git mysite

# Go into the cloned site
cd mysite

# Initialize a .lando.yml for this site
lando init --recipe mean
```

### 2. Get your site from GitHub

```bash
# Create a folder to clone your site to
mkdir mysite

# Initialize a MEAN .lando.yml after getting code from GitHub
# This require a GitHub Personal Access Token
# See: https://docs.lndo.io/cli/init.html#github
lando init github --recipe mean
```

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

Lando will add some helpful environment variables into your `appserver` so you can get database credential information. These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container.

```bash
DB_HOST=database
DB_PORT=27017
```

These are in addition to the [default variables](./../config/services.md#environment) that we inject into every container.

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

Next Steps
----------

*   [Adding additional services](./../tutorials/setup-additional-tooling.md)
*   [Adding additional tooling](./../tutorials/setup-additional-tooling.md)
*   [Adding additional routes](./../config/proxy.md)
*   [Adding additional events](./../config/events.md)
*   [Setting up front end tooling](./../tutorials/frontend.md)
*   [Accessing services (eg your database) from the host](./../tutorials/frontend.md)
*   [Importing databases](./../tutorials/db-import.md)
