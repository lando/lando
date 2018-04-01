Using Composer to Manage a Project
==================================

You can use composer to manage a project by including a `composer.json` file alongside of your `.lando.yml` file and adding a build step to run `composer install` for your project. Let's get started.

*   Adding in a `composer install` build step
*   Adding composer managed tools like `phpunit` and `phpcs`
*   Adding composer `test` scripts section in `composer.json`
    *   Run your `phpunit` and `phpcs` tests with `lando composer test`

Generate a Project Directory and a `composer.json` File
-------------------------------------------------------

Use this composer command to generate the `composer.json` file for your project:

```bash
composer create-project drupal-composer/drupal-project:~7.0 composer-drupal7 --stability dev --no-interaction
```

Change into that directory:

```bash
cd composer-drupal7
```

Generate a `.lando.yml` File for your Project
---------------------------------------------

You can issue `lando init` and name the app `composer-drupal7`

```bash
lando init --recipe drupal7 --name composer-drupal7
```

Output should be similar to:

```bash
geoff@yep composer-drupal7 $ lando.dev init --name composer-drupal7
? What recipe do you want to use? drupal7
? Where do you want to create this app? /Users/geoff/code/composer-drupal7
? Where is your webroot relative to the init destination? web

NOW WE\'RE COOKING WITH FIRE!!!

Your app has been initialized.
Now try running `lando start` to get rolling.

Here are some vitals:

 NAME    composer-drupal7
 RECIPE  drupal7
 DOCS    https://docs.devwithlando.io/recipes/drupal7.html
```

That should generate the following `.lando.yml` file:

```yaml
name: composer-drupal7
recipe: drupal7
config:
  webroot: web

```

Adding a `build` Step to Your `.lando.yml` File
-----------------------------------------------

Adding the build step to run `composer install` allows you to pass off your app to your team members with just the `composer.json` file and they will be able to pull in all the dependencies by just running `lando start`!

Open your `.lando.yml` file and add the following `services` section:

```yaml
services:
  appserver:
    # Add a Build Step to your App.
    run:
      - "cd $LANDO_MOUNT && composer install"
```

Now whenever you restart or start your app it will pull in all the necessary dependencies via composer!  For example if your colleague adds pathauto to the project via `composer require drupal/pathauto`.  Then all you need to do is `git pull` and then restart your app with `lando restart` and you will have `pathauto` too!

Adding `phpunit` and Tooling Route
----------------------------------

You can add in additional composer managed packages easily. Let's add `phpunit`. At the command line type:

```bash
lando composer require phpunit/phpunit --dev
```

Open your `.lando.yml` file and add the following:

```yaml
tooling:
  phpunit:
    service: appserver
    description: "Run PHP Unit tests: lando phpunit"
```

Restart your app: `lando restart`. Now let's add a `scripts` section to our `composer.json` file. We can use the `scripts` key and have `composer` run our unit tests via `phpunit`.

Open your `composer.json` file and add in:

```json
"scripts": {
    "test": [
        "./vendor/bin/phpunit || true"
    ]
},
```

Now you can run the command:

```bash
lando composer test
```

and that will run phpunit for you.  Let's define a simple unit test. First add a `phpunit.xml` file to the root of your project. You can copy this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit backupGlobals="false"
         backupStaticAttributes="false"
         bootstrap="vendor/autoload.php"
         colors="true"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         processIsolation="false"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Application Test Suite">
            <directory>./tests/</directory>
        </testsuite>
    </testsuites>
    <filter>
        <whitelist>
            <directory suffix=".php">web/</directory>
        </whitelist>
    </filter>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="QUEUE_DRIVER" value="sync"/>
    </php>
</phpunit>

```

Make a `tests` directory in the root of your app.

```bash
mkdir tests
```

Add your first test!  Create a file in the `tests` directory named `StackTest.php` and paste in the following code:

```php
<?php
use PHPUnit\Framework\TestCase;

class StackTest extends TestCase
{
    public function testPushAndPop()
    {
        $stack = [];
        $this->assertEquals(0, count($stack));

        array_push($stack, 'foo');
        $this->assertEquals('foo', $stack[count($stack)-1]);
        $this->assertEquals(1, count($stack));

        $this->assertEquals('foo', array_pop($stack));
        $this->assertEquals(0, count($stack));

        print "\n\n\tGeoff is the best.\n\n";
    }
}
?>
```

Now running `lando composer test` will run your first Unit Test! Well Done! you can read more about PHPUnit here: [https://phpunit.de/manual/current/en/writing-tests-for-phpunit.html](https://phpunit.de/manual/current/en/writing-tests-for-phpunit.html)

Add `phpcs` and Drupal Coding Standards
--------

Let's add `phpcs`, `drupal/coder`, and add linting to the `scripts` key in `composer.json`.  Then we will have automated code linting helping to keep our code bases lean and mean.

```bash
lando composer require overtrue/phplint --dev
lando composer require squizlabs/php_codesniffer:2.7.0 --dev
lando composer require drupal/coder:8.2.9 --dev
```

Add a `.phplint.yml` configuration file to tell what code to test and what to ignore.  Put the `.phplint.yml` file in the root of your app.

```yaml
path: ./web/sites/all
extensions:
  - php
  - module
  - inc
  - install
exclude:
  - modules/contrib
  - libraries

```

Add the linting and code standards to the `test` section of `composer.json`:

```json
"scripts": {
  "test": [
    "./vendor/bin/phpunit || true",
    "./vendor/bin/phplint --configuration=.phplint.yml --no-cache ./web/sites/all/modules/custom",
    "./vendor/bin/phpcs --standard=./vendor/drupal/coder/coder_sniffer/Drupal ./web/sites/all/modules/custom --extensions=php,inc,module,install"
  ]
},
```

Now running the command:

```bash
lando composer test
```

runs your PHPUnit tests, code linting and code style checks! Well done to you!
