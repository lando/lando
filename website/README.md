---
home: true
navbar: true
pageClass: lando-front
layout: Lando

heroImage: /images/hero-white.png
byline: Free yourself from the mind-forged manacles of lesser dev tools. Save time, headaches, frustration and do more real work.

whyLando: While developers love Lando because it's free, open source and awesome... Lando actually exists to solve business problems by removing tons of unneeded complexity from development workflows thereby maximizing value delivery to clients and customers.
whys:
- title: Easy
  details: Don't waste time fighting your tools. Install lando and get your first project rolling in minutes regardless of the tech or your operating system.
- title: Complete
  details: Lando runs most major languages and services in most places. Replace your exisiting suite of dev tools and standardize on only Lando instead.
- title: Battle Tested
  details: 10,000+ developers strong and growing. Lando is battle tested, supported and vetted by a core group of maintainers and a great open source community.
- title: Portable
  details: Specify simple or complex dev requirements in a single config file and ship them to all your devs. Your Lando config can be two lines or it can emulate complex hosting environments and powerful automation.
- title: Sane Defaults
  details: Built on top of Docker Compose, Lando automatically sets up normally arduous things like SSL, SSH keys, pretty urls, cross container networking, build steps, run time automation events and fast file sharing.
- title: Powerful Overrides
  details: Don't like our defaults? Every part of Lando is customizable down to the Docker level. This means you get all the benefits of Lando without sacrificing any of the power.

whereByline: Lando is not meant for production but you can run it pretty much anywhere. For example it works locally on macOS, Linux and Windows, in a continuous integration environment like Travis, CircleCI, Jenkins or as a throwaway preview environment on AWS, among other things!
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

whatByline: Lando runs most major languages, frameworks, services and dev tools all in isolated containers that won't pollute your machine. In fact, you don't need any other tool but Lando! Here are some of the things our users like best...
whatLanguages:
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
whatFrameworks:
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
whatServices:
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

howByline: The main idea behind Lando is a user should be able to clone a repository, run a single command and get everything they need to work on their site locally in a few minutes.
---

### 1. Initialize a codebase for usage with Lando

This will create a starter Lando config file that you can then slowly augment with further dependencies as needed. You can initialize from code in a local folder or pull in code from a remote archive, git repo, GitHub or [Pantheon](https://pantheon.io)!

Here are a few examples...

```bash
# Interactively initialize your code
lando init
```

```bash
# Set up a mean recipe that runs on a particular port with a particular command
lando init --source cwd \
--recipe mean \
--option port=3000 \
--option command="yarn watch" \
--name meanest-app-youve-ever-seen
```

```bash
# Interactively clone a site from Pantheon
lando init --source pantheon
```

```bash
# Spin up a new Drupal 7 site
lando init \
--source remote \
--remote-url https://ftp.drupal.org/files/projects/drupal-7.59.tar.gz \
--remote-options="--strip-components 1" \
--recipe drupal7 --webroot . \
--name hello-drupal7
```

<div class="learn-more">
  <a href="https://docs.lando.dev/basics/init.html" target="_blank">Learn how to initialize in more ways >></a>
</div>

### 2. Optionally customize your new Landofile for MOAR POWER

While our recipe defaults are plenty good for most use cases Lando let's you customize further. This means you can configure our [recipes](https://docs.lando.dev/config/recipes.html#config), add [additional services](https://docs.lando.dev/config/services.html#services), [proxy routes](https://docs.lando.dev/config/proxy.html#proxy), [tooling commands](https://docs.lando.dev/config/tooling.html#tooling), [build steps](https://docs.lando.dev/config/services.html#build-steps), [runtime automation](https://docs.lando.dev/config/events.html#events), and [Docker Compose overrides](https://docs.lando.dev/config/services.html#overrides) or do nothing at all!

Here is a progressively complexifying WordPress example...

#### Default WordPress recipe Landofile config

```yaml
name: my-app
recipe: wordpress
```

#### Adding some basic recipe config

```yaml
name: my-app
recipe: wordpress
config:
  database: postgres
  php: '7.3'
  xdebug: true
```

#### Adding node tooling, solr, phpmyadmin and custom php config

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

#### Adding php extensions, build steps, automation, docker overrides

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

<div class="learn-more">
  <a href="https://docs.lando.dev/config/" target="_blank">Learn how to configure all the things >></a>
</div>

### 3. Try out some tooling commands

Lando isn't only about containerized services to run your application it also containerizes common dev tools like `node`, `composer`, `drush`, `artisan` and `python`. Try running `lando` after you start a project to see the tools available to your app, or [add additional tooling]().

Here are some commands for our complex WordPress config above.

```bash
# See what tools are available in your app
lando
```

```bash
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

<div class="learn-more">
  <a href="https://docs.lando.dev/config/tooling.html" target="_blank">Learn how to configure tooling >></a>
</div>

### 4. Deploy and distribute

Once you are feeling good about your Landofile, commit it to your repository so other developers can easily get setup.

#### Project lead commits

```bash
# Commit and deploy
git add .lando.yml
git commit -m "Supercharge my dev"
git push
```

#### Other developers get

```bash
# Get the project
git clone my-project
cd my-project

# Start lando and get all the things you need
lando start
```
