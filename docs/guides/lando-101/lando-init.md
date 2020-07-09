---
title: Lando Init
metaTitle: Lando Init | Lando
description: Introduction to Lando ~ Using lando init command.
summary: Introduction to Lando ~ Using lando init command.
date: 2020-06-16T13:44:13.109Z
original: 
repo: 

author:
  name: Team Lando
  pic: https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd
  link: https://twitter.com/devwithlando

feed:
  enable: true
  author:
    - name: Team Lando
      email: alliance@lando.dev
      link: https://twitter.com/devwithlando
  contributor:
    - name: Team Lando
      email: alliance@lando.dev
      link: https://twitter.com/devwithlando
---

# Lando Init

<GuideHeader test="https://github.com/lando/lando/blob/master/examples/lando-101/README.md" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

The `lando init` command follows the pattern of `git init` or `npm init`. Where `lando init` will prompt you with some questions and prepares a `.lando.yml` configuration file for you. You can run `lando init` from an empty directory or from an extant codebase.

Let's step through the questions that `lando init` prompts us with:

```bash
gff ~/code/lando-ops/guides-example-code/introduction-to-lando/lando-init 
() └─ ∴ lando init
? From where should we get your app's codebase? 
  current working directory 
  github 
  pantheon 
  platformsh 
❯ remote git repo or archive 
```

The first question is `? From where should we get your app's codebase?` and it wants to know where the application code lives, i.e. if you are in an application that you want to initialize for use with Lando you would choose `current working directory`.

The next question is `? What recipe do you want to use?`. Recipes are pre-configured start states that Lando knows about. For this course we'll choose the LAMP recipe.

```bash
? What recipe do you want to use? (Use arrow keys)
❯ lamp 
  laravel 
  lemp 
  mean 
  pantheon 
  platformsh 
  wordpress 
(Move up and down to reveal more choices)
```

Next up Lando prompts us for the webroot of the application: `? Where is your webroot relative to the init destination?` The webroot can be nested or it can be in the same location as the `.lando.yml` file the project root. For this course we'll leave the default `.` for the current working directory.

```bash
? Where is your webroot relative to the init destination? (.)
```

Then Lando needs to know a name for our application:

```bash
? What do you want to call this app? Lando 101
```

We'll name this app `Lando 101`.

That's it!

We've successfully initialized our first Lando app. We should see a message similar to:

```bash
? What do you want to call this app? lando-101

   _  __                       _         
  / |/ /__ _    __  _    _____( )_______ 
 /    / _ \ |/|/ / | |/|/ / -_)// __/ -_)
/_/|_/\___/__,__/  |__,__/\__/ /_/  \__/ 
                                         
  _________  ____  __ _______  _______  _      ______________ __  ___________  ______
 / ___/ __ \/ __ \/ //_/  _/ |/ / ___/ | | /| / /  _/_  __/ // / / __/  _/ _ \/ __/ /
/ /__/ /_/ / /_/ / ,< _/ //    / (_ /  | |/ |/ // /  / / / _  / / _/_/ // , _/ _//_/ 
\___/\____/\____/_/|_/___/_/|_/\___/   |__/|__/___/ /_/ /_//_/ /_/ /___/_/|_/___(_)  
                                                                                     
Your app has been initialized!

Go to the directory where your app was initialized and run lando start to get rolling.
Check the LOCATION printed below if you are unsure where to go.

Oh... and here are some vitals:

 NAME      lando-101                                                                     
 LOCATION  /home/gff/code/lando-ops/guides-example-code/introduction-to-lando/lando-init 
 RECIPE    lamp                                                                          
 DOCS      https://docs.lando.dev/config/lamp.html   
```

And the result is that Lando has written a `.lando.yml` configuration file for us in the project root. If you are following along that file should look like this:

```yaml
name: lando-101
recipe: lamp
```
The `.lando.yml` file gives Lando the information it needs to spin up your application. In this case just two lines! The `name` of the app and the `recipe` to use. We recommend that you commit the `.lando.yml` file to version control so that everyone on your team can have the exact same configuration for development.

You can see the full documentation for [lando init](/basics/init.html).
<GuideFooter test="" original="" repo=""/>
<Newsletter />
