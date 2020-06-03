---
metaTitle: A Local Dev Tool For Every Project | Lando
description: Lando is a free, open source and Docker driven local development tool for all projects that is fast, easy, powerful, liberating and works on Windows, macOS and Linux.
image: https://raw.githubusercontent.com/lando/lando/master/docs/.vuepress/public/images/hero-pink.png

home: true
navbar: true
pageClass: lando-front

heroImage: /images/hero-white.png
byline: Free yourself from the mind-forged manacles of lesser dev tools. Save time, headaches, frustration and do more real work.

whyLando: Lando vastly simplifies local development and DevOps so you can focus on what's important; delivering value to your clients and customers. It's...
whys:
- title: Easy
  details: Get your first project rolling in minutes regardless of the tech or your operating system.
- title: Complete
  details: Run almost anything, anywhere; throw away your other dev tools and use the one dev tool to rule them all.
- title: Battle Tested
  details: Supported by a core group of maintainers and a growing community 10,000+ developers strong.
- title: Portable
  details: Specify simple or complex dev requirements in a single config file and ship them to all your devs.
- title: Sane Defaults
  details: Automatically set up normally arduous things like SSL, SSH keys, pretty urls, cross container networking, build steps, run time automation events and fast file sharing.
- title: Powerful Overrides
  details: Don't like our defaults? Every part of Lando is overrideable down to the Docker Compose level. This means you get all the benefits of Lando without sacrificing any of the power of Docker.
- title: Free
  details: Pay nothing.
- title: Open Source
  details: See everything.

whereByline: Lando is meant to be run locally but you can run it pretty much anywhere.
wheres:
- title: Apple
  icon: devicon-apple-original
- title: Linux
  icon: devicon-linux-plain
- title: Windows
  icon: devicon-windows8-original
- title: Travis
  icon: devicon-travis-plain
- title: Jenkins
  icon: devicons devicons-jenkins
- title: Amazon Web Services
  icon: devicon-amazonwebservices-original

whatByline: Lando runs pretty much everything, all in isolated containers that won't pollute your machine. Here are some common use cases...
whats:
- title: PHP
  icon: devicon-php-plain
- title: JavaScript/NodeJS
  icon: devicon-nodejs-plain
- title: Ruby
  icon: devicon-ruby-plain-wordmark
- title: Python
  icon: devicon-python-plain-wordmark
- title: dotnet
  icon: devicon-dot-net-plain-wordmark
- title: go
  icon: devicon-go-plain
- title: java
  icon: devicon-java-plain-wordmark
- title: AngularJS
  icon: devicon-angularjs-plain
- title: Bootstrap
  icon: devicon-bootstrap-plain-wordmark
- title: CodeIgniter
  icon: devicon-codeigniter-plain-wordmark
- title: Django
  icon: devicon-django-plain
- title: Drupal
  icon: devicon-drupal-plain-wordmark
- title: Express
  icon: devicon-express-original
- title: Jekyll
  icon: devicons devicons-jekyll_small
- title: Joomla
  icon: devicons devicons-joomla
- title: Laravel
  icon: devicon-laravel-plain-wordmark
- title: Rails
  icon: devicon-rails-plain-wordmark
- title: React
  icon: devicon-react-original-wordmark
- title: Symfony
  icon: devicon-symfony-original-wordmark
- title: Vue.js
  icon: devicon-vuejs-plain-wordmark
- title: WordPress
  icon: devicon-wordpress-plain-wordmark
- title: Apache
  icon: devicon-apache-plain-wordmark
- title: Composer
  icon: devicons devicons-composer
- title: MySQL
  icon: devicon-mysql-plain-wordmark
- title: mongodb
  icon: devicon-mongodb-plain-wordmark
- title: nginx
  icon: devicon-nginx-original
- title: postgresql
  icon: devicon-postgresql-plain-wordmark
- title: redis
  icon: devicon-redis-plain-wordmark
- title: tomcat
  icon: devicon-tomcat-line-wordmark

howByline: Commit a Landofile that describes your project's dependencies to your code repository and collaborate like you would any other file.
---
<div class="step">
  <div class="left">
    <div class="step-number"><p>1</p></div>
  </div>
  <div class="right">
    <h3>Initialize a codebase to get a Landofile</h3>
  </div>
</div>

Here are a few examples...

#### Interactively initialize your code

```bash
lando init
```

<br />

#### Set up a mean recipe that runs on a particular port with a particular command

```bash
lando init --source cwd \
  --recipe mean \
  --option port=3000 \
  --option command="yarn watch" \
  --name meanest-app-youve-ever-seen
```

<br />

#### Interactively clone a site from Pantheon

```bash
lando init --source pantheon
```

<br />

#### Spin up a new Drupal 7 site

```bash
lando init \
  --source remote \
  --remote-url https://ftp.drupal.org/files/projects/drupal-7.71.tar.gz \
  --remote-options="--strip-components 1" \
  --recipe drupal7 --webroot . \
  --name hello-drupal7
```

<div class="step-end" />

<div class="step">
  <div class="left">
    <div class="step-number"><p>2</p></div>
  </div>
  <div class="right">
    <h3>Optionally customize your Landofile for MOAR POWER</h3>
  </div>
</div>

Here is a progressively complexifying WordPress example...

#### Default WordPress recipe Landofile config, good for most use cases out of the box

```yaml
name: my-app
recipe: wordpress
```

<br />

#### Add some basic recipe config

```yaml
name: my-app
recipe: wordpress
config:
  database: postgres
  php: '7.3'
  xdebug: true
```

<br />

#### Add node tooling, solr, phpmyadmin and custom php config

```yaml
name: my-app
recipe: wordpress
config:
  database: postgres
  php: '7.3'
  xdebug: true
  config:
    php: my-custom-php.ini
proxy:
  pma:
   - database-my-app.lndo.site
services:
  index:
    type: solr
  node:
    type: node:10
    globals:
      gulp: latest
  pma:
    type: phpmyadmin
    hosts:
      - database
tooling:
  yarn:
    service: node
  node:
    service: node
```

<br />

#### Add php extensions, build steps, automation, docker overrides

```yaml
name: my-app
recipe: wordpress
config:
  database: postgres
  php: '7.3'
  xdebug: true
  config:
    php: my-custom-php.ini
events:
  post-db-import:
    - appserver: wp search-replace
proxy:
  pma:
   - database-my-app.lndo.site
services:
  appserver:
    build_as_root:
      - apt update -y && apt-get install vim -y
      - /helpers/my-script-to-install-php-extension.sh memcached
    build:
      - composer install
    overrides:
      environment:
        APP_LEVEL: dev
        TAYLOR: swift
  index:
    type: solr
  node:
    type: node:10
    globals:
      gulp: latest
    build:
      - yarn
  frontend:
    type: node:10
    command: yarn start
    build:
      - yarn
  pma:
    type: phpmyadmin
    hosts:
      - database
tooling:
  yarn:
    service: node
  node:
    service: node
  gulp:
    service: node
  test:
    cmd:
      - appserver: composer test
      - frontend: yarn test
  deploy:
    service: appserver
    cmd: /path/to/script.sh
```

<div class="step-end" />

<div class="step">
  <div class="left">
    <div class="step-number"><p>3</p></div>
  </div>
  <div class="right">
    <h3>Start it up and try out some tooling commands</h3>
  </div>
</div>

Here are some commands for our complex WordPress config above.

#### Start your app

```bash
lando start
```

<br />

#### Explore its tooling options

```bash
# See what tools are available in your app
lando

# Run wp-cli commands
lando wp

# Drop into a postgres shell
lando psql

# Import a database
lando db-import dump.sql

# Run composer and yarn tests
lando test

# Install more node packages
lando yarn add bootstrap

# Start up gulp watch
lando gulp watch
```
<div class="step-end" />

<div class="step">
  <div class="left">
    <div class="step-number"><p>4</p></div>
  </div>
  <div class="right">
    <h3>Commit and distribute</h3>
  </div>
</div>

Once you are feeling good about your Landofile, commit it to your repository so other developers can easily get spun up.

#### Project lead commits to the repo

```bash
git add .lando.yml
git commit -m "Supercharge my dev"
git push
```

#### Now subsequent developers only need to git clone and lando start

```bash
git clone my-project & cd my-project & lando start
```
<div class="step-end" />


<div class="step">
  <div class="left">
    <div class="step-number"><p>5</p></div>
  </div>
  <div class="right">
    <h3>Focus on more important shit</h3>
  </div>
</div>

Enjoy the benefits of lives-in-repo config, per-app local dev dependency management and standardization.

<div class="step-end" />
