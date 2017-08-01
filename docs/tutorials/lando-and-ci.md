Run Lando with CI
----

In this example we will spin up a Lando Drupal 8 app and add a `.travis.yml` config file to demonstrate how to use Lando in conjunction with a Continuous Integration (CI) service. In practice this could be Travis CI, Circle CI, or any CI provider.

Spin up an App
----

In this case we will use a Pantheon Drupal 8 app.

* Visit your Pantheon Dashboard
* Add a new site and get its machine name. I used `ci-tutorial`. Use whatever name you want for your app and replace `ci-tutorial` out for your app name.
* Make a directory on your local machine for the app:
  * `mkdir ci-tutorial`
  * `cd ci-tutorial`
* Pull down the `ci-tutorial` app from Pantheon
  * `lando ci-tutorial pantheon`
  * Full details at [Pantheon](pantheon.md)

Add Travis CI and GitHub into the Mix
----

* Spin up a repo on GitHub and add it as a remote
  * `git remote add github {URL_TO_GITHUB_REPO}`
* Add a `.travis.yml` file.

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
