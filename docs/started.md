Lando Basics
============

In order for you to experience all the awesome Lando power a `.lando.yml` needs to exist in the root directory of an existing project. Lando does **not** install a new codebase for you unless you init with either the `pantheon` or `github` method.

On a high level the `.lando.yml` should contain **ALL** the things you need to both run and develop your project. The ideal workflow here is:

1. The person who sets up your DevOps creates a `.lando.yml` file for your project and ideally checks it into version control
2. Subsequent devs clone down the project, run `lando start` and get equipped with all the things they need for the devs

We **HIGHLY** recommend you read through our documentation to get a sense of the things the `.lando.yml` can do for your team but here is a non-exhaustive list of things it can do:

* Instantiate "sane defaults" for various pre-baked recipes like Drupal, Laravel or MEAN
* Integrate with various hosting providers like [Pantheon](http://pantheon.io)
* Add configurable auxiliary services like `elasticsearch`, `redis` or `mailhog`
* Lock down versions, on a per-project basis, for front end tools like `node`, `yarn`, `gulp`, etc.
* Setup relevant build steps like `composer install`, `yarn install` or `gulp sass`
* Add in additional dependencies like `php-extensions`, `apache tika`, `phantomjs` or even `vim`
* Add in event-driven hooks like `drush cim -y` after a `db-import`

There are various ways to initialize a `.lando.yml` for your project, here is a list of them ordered from least to most difficult.

1. `lando init <METHOD>`
------------------------

Lando offers a few [init methods](./cli/init.md) that will:

1. Automatically set up relevant `ssh` keys (you need some sort of api key or token)
2. Clone your site from the given method
3. Interactively set up a barebones "sane default" recipe for your project

Currently we support init methods from either [GitHub](https://github.com) or [Pantheon](https://pantheon.io). Here are some examples on how to use Lando to initialize.

```bash
# Create a folder to clone your site to
# NOTE: this folder needs to be empty for this method to work
mkdir mysite && cd mysite

# Setup keys, clone a GitHub site and interactively set up a recipe start state
# This requires a GitHub Personal Access Token
# See: https://docs.devwithlando.io/cli/init.html#github
lando init github

# OR #

# Initialize a Pantheon specific .lando.yml after getting code from Pantheon
# This requires a Pantheon Machine Token
# See: https://docs.devwithlando.io/cli/init.html#pantheon
lando init pantheon

# OR #

# Initialize a Pantheon .lando.yml after getting code from GitHub
# This requires a GitHub Personal Access Token
# This requires a Pantheon Machine Token
# See: https://docs.devwithlando.io/cli/init.html#github
# See: https://docs.devwithlando.io/cli/init.html#pantheon
lando init github --recipe pantheon
```

The following is equivalent but requires the user is aware of how [ssh keys](./config/ssh.md) work on Lando.

```bash
# Create a folder to clone your site to
# NOTE: this folder needs to be empty for this method to work
mkdir mysite && cd mysite

# Get your site from somewhere
# For this example we assume you are getting it from some remote git repo
git clone https://url.to.my.repo.git

# Initialize my site
lando init
```

2. `lando init`
---------------

If you've already got your project locally and have relevant [ssh keys](./config/ssh.md) set up for use with Lando then you can do the following:

```bash
# Go into your project
cd /path/to/my/project

# Interactively initialize your site
lando init

# OR #

# Specify a particular recipe to init with
lando init --recipe drupal7
```

3. Create manually
------------------

You can also manually craft a `.lando.yml` from a project you've already cloned down locally and set up relevant [ssh keys](./config/ssh.md) for.

```bash
# Go into your project
cd /path/to/my/project

# Create a .lando.yml file
touch .lando.yml

# Open up a text editor to craft it
vi .lando.yml
```

Here is a good example of a generic LEMP stack `.lando.yml`

{% codesnippet "./../examples/lemp2/.lando.yml" %}{% endcodesnippet %}
