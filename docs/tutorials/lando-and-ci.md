Using Lando with a CI Service
=============================

In this example we will spin up a Lando LEMP app and add a `.travis.yml` config file to demonstrate how to use Lando in conjunction with a Continuous Integration (CI) service. In practice this could be Travis CI, Circle CI, or any CI provider but this example will use Travis CI.

This will be a barebones example that does basic php linting.

Here is the `.travis.yml` file I am using:

```yaml
language: php
php:
- '7.0'
services:
- docker

before_install:
- sudo apt-get -y update
- sudo apt-get -y install cgroup-bin curl
- curl -fsSL -o /tmp/lando-latest.deb http://installer.kalabox.io/lando-latest-dev.deb
- sudo dpkg -i /tmp/lando-latest.deb

script:
# start lando and perform some setup tasks.
- lando start -- -v
- lando version
- cd /home/travis/build/serundeputy/ci-tutorial/
- lando composer install

# Run phplint code check.
- lando composer test
```

Now we need to add the `overtrue/phplint` library to the project.
* `composer require overtrue/phplint --dev`

Now you can add a `scripts` key to you `composer.json` file like so:

```json
"scripts": {
  "test": [
    "./vendor/bin/phplint --configuration=./.phplint.yml --no-cache --exclude=contrib modules/custom"
  ]
},
```

Now we can run the linting check against the lando app with:

```
lando composer test
```

That's great! More importantly though now each time we file a PR against the GitHub repo it will:

* Spin up a Travis CI environment
* Install Lando on Travis
* Install composer dependencies
* Run the phplint code check

If the CI checks pass you can merge with confidence!

Full Example
------------

{% codesnippet "./../examples/lando-and-ci/.lando.yml" %}{% endcodesnippet %}
