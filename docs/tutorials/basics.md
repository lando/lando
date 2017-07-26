Getting Started
===============

To get started, we need to create a `.lando.yml` file for our project. `.lando.yml` files are the instructions for how to build and run your app. They include information on where your code lives, what services your project needs to run (ex: Apache/MySQL/PHP), and a host of [other options]().

- [Start from an existing codebase](#start-from-an-existing-codebase)
- [Start from Github](#start-from-github)

Start From An Existing Codebase
-------------------------------

If you have your codebase installed locally, simply run...

`lando init myapp`

This will initialize a dialogue which allows you to select a [recipe](./../config/recipes.md) that will automatically create infrastructure to run your app. `lando init` will create a `.lando.yml` file in the root of your app directory.

Start From Github
-----------------

If you already have project source code on Github, you can easily pull it down with Lando. First make a directory for your app:

`mkdir github-app-name && cd github-app-name`

Then initialize your app:

`lando init github-app-name github`

The init command will ask you for a [personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/#creating-a-token), which you can generate from your Github account. Make sure to grant the `repo`, `admin:public_key` and `user` scopes when creating your token.
