Using Composer to Manage a Project
===============

You can use composer to manage a project by including a `composer.json` file
alongside of your `.lando.yml` file and adding a build step to run `composer install`
for your project. Let's get started.

Generate a Project Directory and a `composer.json` File
-------------------------------

Use this composer command to generate the `composer.json` file for your project:

```bash
composer create-project drupal-composer/drupal-project:~7.0 composer-drupal7 --stability dev --no-interaction
```

Change into that directory:

```bash
cd composer-drupal7
```

Generate a `.lando.yml` File for your Project
------------

You can issue `lando init composer-drupal7` and follow the prompts (where
`composer-drupal7`

```bash
lando init composer-drupal7
```

Output should be similar to:

```bash
geoff@yep composer-drupal7 $ lando.dev init composer-drupal7
? What recipe do you want to use? drupal7
? Where do you want to create this app? /Users/geoff/code/composer-drupal7
? Where is your webroot relative to the init destination? web

NOW WE'RE COOKING WITH FIRE!!!

Your app has been initialized.
Now try running `lando start` to get rolling.

Here are some vitals:

 NAME    composer-drupal7
 RECIPE  drupal7
 DOCS    https://docs.lndo.io/recipes/drupal7.html
```

That should generate the following `.lando.yml` file:

```yaml
name: composer-drupal7
recipe: drupal7
config:
  webroot: web

```

Adding a `build` Step to Your `.lando.yml` File
----------
Adding the build step to run `composer install` allows you to pass off your app
to your team members with just the `composer.json` file and they will be able to
pull in all the dependencies by just running `lando start`!


Open your `.lando.yml` file and add the following `services` section:

```yaml
services:
  appserver:
    # Add a Build Step to your App.
    build:
      - "cd $LANDO_MOUNT && composer install"
```

Now whenever you restart or start your app it will pull in all the necessary
dependencies via composer!  For example if your colleague adds pathauto to the
project via `composer require drupal/pathauto`.  Then all you need to do is
`git pull` and then restart your app with `lando restart` and you will have
`pathauto` too!
