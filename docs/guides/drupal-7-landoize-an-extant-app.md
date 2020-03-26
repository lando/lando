---
title: Drupal 7 Landoize an Extant App
metaTitle: Drupal 7 Landoize an Extant App | Lando
description: Use Lando as local development environment for an existing Drupal 7 app.
date: 2020-01-21T17:34:56.556Z
original: 
repo: 

author:
  name: Geoff St. Pierre
  pic: https://www.gravatar.com/avatar/e103c2a2a8f8caf5848b38b80422cdd9
  link: https://twitter.com/serundeputy

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

# Drupal 7 Landoize an Extant App

<GuideHeader name="Geoff St. Pierre" pic="https://www.gravatar.com/avatar/e103c2a2a8f8caf5848b38b80422cdd9" link="https://twitter.com/serundeputy" />

If you and your team have an existing Drupal 7 application that you would like to use Lando for local development you just need to add a `.lando.yml` configuration file
to the project and commit it to git.

First in a terminal move to the directory that contains your Drupal 7 project:

```bash
cd PATH/TO/YOUR/DRUPAL7/APP
```

## Lando Init


Then use the `lando init` command to build your `.lando.yml` file:

```bash
lando init
```

Lando will ask you `From where should we get your app's codebase?` select `current working directory`.

<img src="/images/drupal7-extant/landoInit.jpg" />

Then Lando will ask you `What recipe do you want to use?` select `drupal7`.

<img src="/images/drupal7-extant/landoCodeBase.jpg" />

Then Lando needs to know what directory has the Drupal code it asks `Where is your webroot relative to the init destination?` If your
code is in the current directory you can just hit enter.


<img src="/images/drupal7-extant/landoWebroot.jpg" />

::: tip Nested Web Root
If you are using a nested web root then you should
specify the path to the Drupal code here like: `web`
:::

Then Lando prompts for the app name: ` What do you want to call this app?` you can type anything you like, i.e. MyApp.

<img src="/images/drupal7-extant/landoAppName.jpg" />

The `lando init` command will create the `.lando.yml` config file for you. If you chose the `drupal7` recipe your config file should look like this:

```yaml
name: myapp
recipe: drupal7
config:
  webroot: .
```

## Lando Start


Now you are ready to start your app.

```bash
lando start
```

This will build out the containers necessary for your Drupal 7 app. You'll end up with a screen like this once the app is started:

<img src="/images/drupal7-extant/landoStart.jpg" />

Now you can copy any one of the resulting URLs and paste it into a browser to visit your Drupal 7 app running in Lando!

## Pro Tips

If you issue additional terminal commands or clear the screen you can get the URLs and other info about your app anytime by using the `lando info` command:

```bash
lando info
```

The info command will give you lots of useful information about your app:

<img src="/images/drupal7-extant/landoInfo.jpg" />


<GuideFooter />
<Newsletter />
