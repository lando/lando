---
title: Importing a remote database and files into Lando using Laravel Envoy
description: Add a pull command for LAMP, LEMP, Drupal, Backdrop, Laravel, PHP apps hosted on metal.
summary: Add a pull command for LAMP, LEMP, Drupal, Backdrop, Laravel, PHP apps hosted on metal.
date: 2020-03-30T19:23:00.720Z
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

# Importing a remote database and files into Lando using Laravel Envoy

<GuideHeader name="Geoff St. Pierre" pic="https://www.gravatar.com/avatar/e103c2a2a8f8caf5848b38b80422cdd9" link="https://twitter.com/serundeputy" />
<YouTube url="" />

If you are hosted on a server like Linode, Digital Ocean, AWS or the like you can still cook up a `lando pull` command to pull your database and/or file assets down from production using Laravel Envoy.

This will work for all Lando apps that extend from `laempy` recipes like: LAMP, LEMP, Dupal 6/7/8, Backdrop, Joomla, WordPress and Laravel.

## Requirements

We'll need a few things to get this set up for our `laempy` apps. We need to require the `laravel/envoy` composer package in our app, configure a `.env` file, configure an `Envoy.blade.php` file to define our tasks, and configure some `tooling` in our `.lando.yml` file. Let's jump in.

## laravel/envoy

To get the `laravel/envoy` package just use `composer`:

```bash
lando composer require laravel/envoy
```

## .env

If you don't have a `.env` file create one and add this to it, if you already have on just add this:

```bash
LP_DB_PWD=<your_db_password>
LP_DB=<your_db_name>
LP_PROJECT_ROOT=<path/to/project/root/on/your/server> # like: /var/www/myapp
LP_SITE_ROOT=<path/to/site/root> # like for nested web root /var/www/myapp/web
LP_DB_BACK_PATH=<path/to/db/backups> # like /home/me/backups/appname/dbs
LP_FILES_BACK_PATH=<path/to/files/backups/f.tgz # like /home/me/backups/appname/files/f.tgz
LP_SSH_CMD=<user>@<server_ip> # like me@server_ip
```
after creating or updating your `.env` file you'll need to rebuild the app.

```bash
lando rebuild -y
```

## Envoy.blade.php

Create a file in the root of your app called `Envoy.blade.php` and add this to it:

```php
@setup
  $ssh = getenv('LP_SSH_CMD');
@endsetup

@servers(['web' => $ssh, 'localhost' => '127.0.0.1'])

@story('pull')
  dump
  getdb
  cleandb
  backupfiles
  getfiles
  cleanfiles
@endstory

@task('dump', ['on' => 'web'])
  mysqldump -u root -p{{ getenv('LP_DB_PWD') }} {{ getenv('LP_DB') }} > {{ getenv('LP_DB_BACK_PATH') }}
@endtask

@task('getdb', ['on' => 'localhost'])
  scp {{ getenv('LP_SSH_CMD') }}:{{ getenv('LP_DB_BACK_PATH') }} db.sql
@endtask

@task('cleandb', ['on' => 'web'])
  rm {{ getenv('LP_DB_BACK_PATH') }}
@endtask

@task('backupfiles', ['on' => 'web'])
  cd {{ getenv('LP_SITE_ROOT') }}
  tar czf {{ getenv('LP_FILES_BACK_PATH') }} files
@endtask

@task('getfiles', ['on' => 'localhost'])
  scp {{ getenv('LP_SSH_CMD') }}:{{ getenv('LP_FILES_BACK_PATH') }} /app/f.tgz
@endtask

@task('cleanfiles', ['on' => 'web'])
  rm {{ getenv('LP_FILES_BACK_PATH') }}
@endtask
```

## .lando.yml

In your `.lando.yml` file tell Lando about your `.env` file and add tooling for the `pull` command.

If you don't have an `env_file` section add one.

```yaml
env_file:
  - .env
```

If you just added this your app will require a rebuild.

```bash
lando rebuild -y
```

In your `tooling` section add.

```yaml
tooling:
  envoy:
    service: appserver
  pull:
    service: appserver
    description: Pull and import the database from production.
    cmd:
      - appserver: envoy run pull
      - database: /helpers/sql-import.sh db.sql
      - appserver: rm db.sql
      - appserver: rm -rf /app/web/files # change this to the /path/to/file/assets for your app.
      - appserver: tar xvzf f.tgz -C /app/web
      - appserver: rm f.tgz
```

## Using the pull command

Now to use your pull command you'll need to configure the `backups` directories as specified in `LP_DB_BACK_PATH` and `LP_FILES_BACK_PATH`
to exist on your server. Then just run:

```bash
lando pull
```

and that will backup your db and file assets and pull them down for you! Happy Lando travels folks.

<GuideFooter test="" original="" repo=""/>
<Newsletter />
