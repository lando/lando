---
title: Lando Configure
metaTitle: Lando Configure | Lando
description: An example using the config key to configure a Lando recipe.
summary: An example of extending a Lando recipe using the config key.
date: 2020-08-12T14:38:22.169Z
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

# Lando Configuration

<GuideHeader test="https://github.com/lando/lando/blob/master/examples/lando-101/README.md" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

As we've seen Lando recipes are very useful and dead simple. So far our `.lando.yml` file for the LAMP recipe is just two lines:

```yaml
name: lando-101
recipe: lamp
```

The power of Lando is our ability to configure and change it to meet our needs. We can configure it to match production for instance. Let's add a PHP file to our `lando-101` app just so we have something to view in our app. Open a file in your favorite text editor and add a call to `phpinfo()` and save it as `index.php`.

```php
<?php
phpinfo();
```

Now if we visit our Lando provide URL for the `lando-101` app `https://lando-101.lndo.site` we will see:

<img src="/images/lando-101/lando-101-index.jpg" />

We can see that this reports the PHP version as `7.3`. Enter the `config` key. Say our production server for the `lando-101` app is running PHP 7.4 and we want to match that in our Lando development environment. We can do that by using the [config](/config/lamp.html#configuration) key in our `.lando.yml` file to configure how the recipe is built. In this case we want PHP 7.4. Edit your `.lando.yml` file like this:

```yaml
name: lando-101
recipe: lamp
config:
  php: 7.4
```

Now let's rebuild our app with the `lando rebuild -y` command. Now if we visit our app in a browser we will see the the PHP version is reported as `7.4`. Simple! Just like that we've configured our app to use a different version of PHP.

You can read the details about the `config` key in the docs: [config](/config/recipes.html#config).


<GuideFooter test="" original="" repo=""/>
<Newsletter />
