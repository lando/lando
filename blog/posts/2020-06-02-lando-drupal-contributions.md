---
title: Lando + Drupal Contributions
metaTitle: Lando + Drupal Contributions | Lando
description: Using lando to facilitate Drupal core and contrib contributions of code, testing, and reviews.
date: 2020-06-30
original: 

author: Geoff St. Pierre
pic: https://www.gravatar.com/avatar/e103c2a2a8f8caf5848b38b80422cdd9
link: https://twitter.com/serundeputy
location: Springfield, MA

tags:
- devops
- development
- lando

feed:
  enable: true
  author:
    - name: Geoff St. Pierre
      email: alliance@lando.dev
      link: https://twitter.com/serundeputy
  contributor:
    - name: Geoff St. Pierre
      email: alliance@lando.dev
      link: https://twitter.com/serundeputy
---

## Why?

Setting up, testing, and writing Drupal patches can be a confusing gauntlet to the uninitiated. To that end
I've set up the [thinktandem/drupal-contributions](https://github.com/thinktandem/drupal-contributions) repo to automate
as much of the process as possible.

The spin ups should be considered completely ephemeral as on every `lando rebuild` events will be fired to tear down
the current code base and rewrite the database with a fresh install.

Using this repo gives you a `.lando.yml` file configured for Drupal contributions:

* Automatically grabs the Drupal source code and runs `composer install` on `lando rebuild -y`
* Automatically kills the source code and database on `lando rebuild -y` so you can start fresh with each patch
* Automatically enables `simpletest`
* Adds a `lando test` command to invoke Drupal simpletests
* Adds a `lando si` command to reinstall the site with fresh DB if you need one (without rebuilding)
* Adds a `lando patch URL` command to pull down and apply a patch from drupal.org
* Adds a `lando revert PATCH_NAME` command should you need/want to revert a patch
* Adds a `lando create-patch` coommand to create a patch from the current branch

## How?

Prefer video:
<YouTube url="https://www.youtube.com/embed/vVpKCQZKNtM?feature=youtu.be&start=589" />

Let's step through how to spin up your contribution workflow. First clone down this repo:

```bash
git clone git@github.com:thinktandem/drupal-contributions.git
cd drupal-contributions
```

This gets us the `.lando.yml` config and scripts to glue all the processes together.

Next `rebuild` the `drupal-contributions` app:

::: tip Rebuild
Note that we are using `rebuild` and not the `start` command. Rebuild has the events
to trigger getting the Drupal source code and installation.
:::

```bash
lando rebuild -y 
```

This will pull in the drupal source code from the `8.8.x` branch, run `composer install` to get dependencies, install Drupal, enable `simpletest` module, and provide us with a one time login link (`uli`).

After `rebuild` completes you should see something similar to this:

```bash
   ___                      __        __        __     __        ______
  / _ )___  ___  __ _  ___ / /  ___ _/ /_____ _/ /__ _/ /_____ _/ / / /
 / _  / _ \/ _ \/  ' \(_-</ _ \/ _ `/  '_/ _ `/ / _ `/  '_/ _ `/_/_/_/ 
/____/\___/\___/_/_/_/___/_//_/\_,_/_/\_\\_,_/_/\_,_/_/\_\\_,_(_|_|_)  
                                                                       

Your app has started up correctly.
Here are some vitals:

 NAME            drupal-contributions                           
 LOCATION        /home/gff/code/drupal-ops/drupal-contributions 
 SERVICES        appserver, database                            
 APPSERVER URLS  https://localhost:33147                        
                 http://localhost:33148                         
                 http://drupal-contributions.lndo.site/         
                 https://drupal-contributions.lndo.site/  
```

and the `web` directory should be populated with the Drupal source code.

## Testing Drupal Patches

Now we are ready to find a Drupal issue. Search the issue queue for an `8.x` issue that you want to test. Grab the URL of the latest patch and apply it to our `drupal-contributions` environment.

For example if you choose this issue: https://www.drupal.org/project/drupal/issues/2962649, the latest corresponding patch (as of 25 June 2020) is https://www.drupal.org/files/issues/2019-09-12/2962649-10.patch. To apply this patch:

```bash
lando patch https://www.drupal.org/files/issues/2019-09-12/2962649-10.patch
```

To revert the patch:

```bash
lando revert 2962649-10.patch
```

This way we can `apply` and `revert` as many times as we want/need to during our testing. 

To test this issue first add a file field to a content type say the page content type at `/admin/structure/types/manage/page/fields`. Now add a `page` node at `/admin/content/add/page` and add a text file to the file field you just made.

Visit the page in your web browser and click the file link. The file shows up in the current window. Now apply the patch with:

```bash
lando patch https://www.drupal.org/files/issues/2019-09-12/2962649-10.patch
```

and visit the `/admin/structure/types/manage/page/display` page and click through the gear to get to the settings of the `file_link` field we added to the `page` content type. You shoud now see a checkbox for `Open file in new tab (target=_blank)` which we can check and save.

Now visit the page or refresh the page in a web browser and click the file link. This time the file opens in a new tab!

The patch works!

We can now leave a comment on the issue saying that we tested the patch and it works as expected for us.

## Creating a Patch

If you are fixing a d.org issue. You shuld checkout a branch using the prescribed naming conventions `ISSUE####-COMMENT#.patch`. Write your code. Commit your code. Then you can utilize the `lando create-patch` to output the patch file based on your branch name.

```bash
lando create-patch
```

This will output a patch file to `/app/web/ISSUE####-COMMENT#.patch`, which you can upload to the drupal.org issue.

## Running Tests

When you create a patch you may have written tests for it that you want to run. At a minimum you'll want to run the tests for the module the patch is for to make sure your changes have not introduced regressions.  To run the tests use the `lando test` command. To see what you can do use:

```bash
lando test --help
```

To run the tests from the `file` module for example use:

```bash
lando test --module file
```

## La Fin

Once you have the `8.8.x` you can keep it and sync it periodically and `lando start`'s will keep that around. If you want to totally start fresh:

```bash
# destroys drupal-contributions app and removes /web
lando destroy -y

# Spin up a fresh checkout of Drupal source installed and ready
# for dev, patching, and testing.
lando rebuild  -y
```

I hope you find this useful. If you find bugs, issues, or want addional features drop an issue in [thinktandem/drupal-contributions](https://github.com/thinktandem/drupal-contributions)
