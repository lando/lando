---
description: Learn how to boot up and initialize your first project for usage with Lando with a Hello World!, Drupal 7 and Pantheon example.
---

# Starting your first app

Now that you've got Lando installed you should try a few easy examples before you _get into it_.

## Hello World!

```bash
# Create a new directory for this example and enter it
mkdir hello && cd hello

# And add a nice homepage
echo "<h1>Lando says hellooo what have we here?</h1>" > index.html

# Initialize a basic LAMP stack using the cwd as the source
lando init \
  --source cwd \
  --recipe lamp \
  --webroot . \
  --name hello-lando

# Check out the Landofile it created for you
cat .lando.yml

# Start it up
lando start

# Check out the commands you can run
lando

# Visit the local site
open https://hello-lando.lndo.site

# Destroy the site
lando destroy -y
```

## Vanilla Drupal 7

You can also pull in code from an external archive (or git repo/GitHub) to seed a new project.

```bash
# Create a new directory for this example and enter it
mkdir drupal7 && cd drupal7

# Initialize a new lando drupal using vanilla d7
lando init \
  --source remote \
  --remote-url https://ftp.drupal.org/files/projects/drupal-7.59.tar.gz \
  --remote-options="--strip-components 1" \
  --recipe drupal7 --webroot . \
  --name hello-drupal7

# Start the site
lando start

# Use the lando-provided drush to do a site install
lando drush si --db-url=mysql://drupal7:drupal7@database/drupal7 -y

# Check out your new site!
open https://hello-drupal7.lndo.site

# Destroy it
lando destroy -y
```

## From Pantheon

If you have a [Pantheon](https://pantheon.io) account you can clone a site locally.

```bash
# Create a new directory for this example and enter it
mkdir pantheon && cd pantheon

# Go through interactive prompts to get your site from pantheon
lando init --source pantheon

# Start it up
lando start

# Import your database and files
lando pull
```

## More

Check out the [`lando init` docs](./init.md) to get a better sense of its power or try running one of our countless [examples](https://github.com/lando/cli/tree/main/examples).

Or subscribe to our training program where we send you material every week to help you learn all the Lando

## Get weekly tutorials

<NewsletterLearn />
