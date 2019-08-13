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
howInitialize:
  title: 1. Setup a project for usage with Lando
  description: Initialize a codebase for usage with Lando. This will create a starter Lando config file that you can slowly augment with the dependencies you need. You can initialize from code in a local folder or pull in code from a remote archive, git repo, GitHub or Pantheon!
  examples:
    - comment: Interactively instantiate your code for use with lando
      code: lando init
    - comment: Interactively instantiate your code for use with lando
      code: lando init
---



- How does it work?

* 1. lando init a site from cwd, github, pantheon
* 2. start the project
* 3. add in auxiliary services
* 4. add in build steps, automation, events, etc
* 5. now other devs can git clone, alndo start, and get all their shit

- Who uses it?

10,000+ developers
