---
description: Learn how to add node services to your Lando app so you can use yarn, npm, grunt, gulp, webpack, etc for all the frontend magic.
date: 2019-11-05
---

# Frontend Tooling

<GuideHeader />

Most modern frontend tooling relies upon the NPM package manager. In this tutorial we'll show you how to add Node to your app, download tools like Gulp/Grunt/Webpack, and run them in your Lando app.

When you're done, you should be able to distribute your Lando app with a full set of frontend tools that are standardized to work the same on every team member's computer.

## Add Node Service

Assuming you're starting with a "Lando-ized" app, open the `.lando.yml` file in the root of your app directory. In this example we'll assume you're using a very basic [LAMP](./../config/lamp.md) recipe.

To install our frontend tooling we need to be able to run Node. Fortunately it's very easy for us to add a basic Node service to our app:

```yml
name: myapp
recipe: lamp

services:
  node:
    type: node
    build:
      - npm install
```

Note the `build` section. This bash command will automatically run when we start our app, installing any Node packages specified in our package.json file.

## Adding Grunt/Gulp/Etc.

While we're now able to install Node packages for our project, we still need to be able to install global tooling like Grunt, Gulp, or other task runners that form the backbone of our frontend tooling. Fortunately, Lando makes this easy through the `globals` tag:


```yml
services:
  node:
    type: node
    build:
      - npm install
      - gulp
    globals:
      gulp-cli: latest
```

You can do the same thing for any NPM project; for example Grunt would be `grunt-cli: "latest"`. This is the equivalent to installing a package with `npm install -g project-name`.

Note we've now added a another command to `build` to automatically run `gulp` every time we start the app. This, of course, assumes that the default `gulp` task is defined otherwise you should expect your build step to fail.

::: tip Package Versions Are Fully Armed and Customizable
You can lock your app tooling to whatever package version you like. Don't use node:6.10? Change to one of the other available versions in the [service documentation](./../config/node.md). And you're free to download whatever version of a global service your heart desires. For example, if you want to lock your team to something more stable than the latest gulp-cli, change that entry in `globals` to `gulp-cli:1.3.0`.
:::

## Making Tooling Available on the CLI

Almost there! All our services are installed, but how do we run a command on the fly, say starting a watch task or running `lando npm install hot-new-thing` to start experimenting with a new package? We could SSH into our node container, but that's SO 2016. Instead, we'll expose our new tooling via the CLI by adding this [`tooling`](./../config/tooling.md) section to our `.lando.yml` file:

```yml
tooling:
  npm:
    service: node
  node:
    service: node
  gulp:
    service: node
  yarn:
    service: node
```

After restarting your app, you should be able to run `lando node`, `lando gulp` or `lando npm` and have the corresponding commands run. This is particularly useful if you want to kickoff a watch task you might have configured, say `lando gulp watch`.

<GuideFooter />
<Newsletter />
