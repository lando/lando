Kalabox
=======

Kalabox is a free and open source local development environment and workflow tool based on (Docker) container technology. Kalabox allows users to spin up hyper-customized, super-fast development environments and to integrate those environments with their hosting provider or continuous integration workflows.

With Kalabox you can...

  * Easily mimic your production environment on local.
  * Setup, develop, pull and deploy your sites super fast.
  * Standardize your teams dev environments and tools on OSX, Windows and Linux.
  * Easily customize or extend tooling, deployment options and basically any other functionality.
  * Free yourself from the tyranny of inferior local development products.

Learn more and get general Kalabox information by visting [our docs](http://docs.kalabox.io).

Getting Started
---------------

Kalabox ships as native installer packages for Windows, OSX, Debian and Fedora. Officially supported versions are available on our [releases page](https://github.com/kalabox/kalabox/releases). To get informed of new Kalabox releases and project updates we encourage you to [sign up for our newsletter](http://www.kalabox.io/).

Once you've [installed Kalabox](http://docs.kalabox.io/en/stable/users/install/#installation) you should have...

  * The Kalabox GUI in your applications folder, linux menu or Windows start menu.
  * The Kalabox CLI available in your terminal. Type `kbox` on a terminal to see.
  * The Kalabox engine running a docker daemon.

Kalabox also packages two kinds of special external plugins that generate Drupal, Wordpress, Backdrop or Pantheon based projects. Read about them below.

### Creating Pantheon Apps

The Kalabox Pantheon app generating plugin allows users to...

  1. Pull down sites they have spun up on their Pantheon dashboard.
  2. Achieve parity with the Pantheon environment locally, including access to power services like Solr and Redis.
  3. Push changes back up to their Pantheon site.
  4. Get Pantheon specific power tools such as Terminus, Drush and WP-CLI.

To read more about the Pantheon plugin check out both the [docs](http://pantheon.kalabox.io/) and its [code](https://github.com/kalabox/kalabox-app-pantheon).

### Creating PHP Apps

The Kalabox PHP app allows users to...

  1. Create basic Drupal, Wordpress and Backdrop sites.
  2. Get some nice power tools to go with their apps like Drush.

To read more about the PHP app check out both the [docs](http://php.kalabox.io/) and its [code](https://github.com/kalabox/kalabox-app-php).

### Creating Custom Apps

You can also easily create your own kinds of apps to develop in Node, Django, Ruby, Python, Frontpage 97, etc. To learn about creating your own apps check out [our docs](http://docs.kalabox.io).

Support
-------

To get help...

  1. Make sure your question isn't answered in either the [core docs](http://support.kalabox.io/en/stable/), the [Pantheon app docs](http://pantheon.kalabox.io/), or the [PHP docs](http://php.kalabox.io/).
  2. Thoroughly search the [Github issue queue](https://github.com/kalabox/kalabox/issues) for any existing issues similar to yours.
  3. If all else fails, create an issue and follow the pre-populated guidelines and the [CONTRIB.MD](https://raw.githubusercontent.com/kalabox/kalabox/v0.13/CONTRIBUTING.md) as best as possible.

Some examples of good issue reporting:

  - [https://github.com/kalabox/kalabox/issues/565](https://github.com/kalabox/kalabox/issues/565)
  - [https://github.com/kalabox/kalabox/issues/557](https://github.com/kalabox/kalabox/issues/557)

Kalabox is an open-source project. As such, support is a community-lead effort. Please help us keep issue noise to a minimum and be patient with the Kalabox community members who donate time to help out.

**If you are interested in dedicated support or customizations, check out [our support offerings.](http://kalabox.io/support)**

Development Releases
--------------------

We produce development releases for every commit merged into our `v2.1` branch. **These releases are not officially supported** but we have made them available to intrepid users who want to try the bleeding edge or are interested in trying out a recent bug fix before
an official release is rolled.

  * **Windows** - [http://installer.kalabox.io/kalabox-latest-dev.exe](http://installer.kalabox.io/kalabox-latest-dev.exe)
  * **Debian** - [http://installer.kalabox.io/kalabox-latest-dev.deb](http://installer.kalabox.io/kalabox-latest-dev.deb)
  * **Fedora** - [http://installer.kalabox.io/kalabox-latest-dev.rpm](http://installer.kalabox.io/kalabox-latest-dev.rpm)
  * **macOS** - [http://installer.kalabox.io/kalabox-latest-dev.dmg](http://installer.kalabox.io/kalabox-latest-dev.dmg)

**NOTE:** Releases can take some time to build after we merge in commits. For that reason you might want to check the time of the last commit and if it is within a few hours you might want to hold off a bit before trying the new latest release.

You can also easily verify that the release you downloaded matches the latest commit. All development releases look something like `v2.1.0-alpha.1-4-g63b0db0`. This means 4 commits after the `2.1.0-alpha.1` tag and with commit hash `g63b0db0`. You should make sure this commit hash matches or comes before the latest commit.

Other Resources
---------------

* [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
