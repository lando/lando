Pantheon GitHub PR/CI/Behat Workflow Using Lando
================================================

GitHub PR - Composer - CI Service workflows are all the rage these days and Pantheon has [some docs](https://pantheon.io/docs/guides/github-pull-requests/) on how to get rolling with a version of this.

Here is another way to get a nice PR based workflow using Lando that:

1.  Uses GitHub for pull requests
2.  Runs tests like Behat
3.  Pushes code back to Pantheon when pull requests are merged

Before you get started you will want to have

1.  A vanilla Pantheon D8 site **(dont use a preexisting site because we will be overwriting it!!!)**
2.  An empty GitHub repo
3.  A Travis project that is set to track the repo in 2.

Getting Your Code Into GitHub
-----------------------------

You can start by cloning our [example workflow repo](https://github.com/kalabox/lando-pantheon-ci-workflow-example) and then pushing it up to the GitHub repo you created earlier.

```bash
# Get our example
git clone https://github.com/kalabox/lando-pantheon-ci-workflow-example.git my-site
cd my-site

# Set up a remote and push back to your repo
git remote add gh git@github.com:path/to/your/repo
git push gh master

# Remove the original origin remote and replace with yours
git remote remove origin
git remote remove gh
git remote add origin git@github.com:path/to/your/repo
```

You should now have a copy of our example pushed up to your new GitHub repo.

Lando-ifying Your Repo
----------------------

Now we want to update the default `.lando.yml` that ships with our example so it is tied to the Pantheon site you created earlier.

```bash
# Update the lando.yml with info about your site
# Go through the interactive prompts
lando init my-site --recipe=pantheon

# Or run it non-interactively
lando init my-site --recipe=pantheon --pantheon-auth=MYPANTHEONMACHINETOKEN --pantheon-site=MYPANTHEONSITEMACHINENAME
```

Let's extend our [Lando and CI](lando-and-ci.md) example to include Behat Behavior Driven Tests (BDD) into our Lando, CI, PR workflow.

1. Create Pantheon Drops 8 site on dashboard
2. Create local drops8 example
3. push that to github
4. landoify the local app
5. set up travis.yml

Spin up an App
--------------

In this case we will use a Pantheon Drupal 8 app.

*   Visit your Pantheon Dashboard
*   Add a new site and get its machine name. I used `ci-tutorial`. Use whatever name you want for your app and replace `ci-tutorial` out for your app name.
*   Make a directory on your local machine for the app:
    *   `mkdir ci-tutorial`
    *   `cd ci-tutorial`
*   Pull down the `ci-tutorial` app from Pantheon
    *   `lando init ci-tutorial pantheon`
    *   Full details at [Pantheon](pantheon.md)

Add Travis CI and GitHub into the Mix
-------------------------------------

*   Spin up a repo on GitHub and add it as a remote
    *   `git remote add github {URL_TO_GITHUB_REPO}`
*   Add a `.travis.yml` file.

There are several steps we need to get Behat working:

* Get Behat and dependencies to work with Drupal
* Configure Behat
  * `tests` directory
  * `behat.yml`
  * Writing tests
* Configure the `composer.json` `scripts` key with a command to run the behat tests via composer
* Configure the `.travis.yml` file to be able to pull in a DB from Pantheon so we have a working Drupal environment on Travis to perform the Behat tests against

Getting Behat and Dependencies
----

Here is the `require-dev` section of my `composer.json` file:

```json
"require-dev": {
  "overtrue/phplint": "^0.2.4",
  "behat/behat": "^3.3",
  "behat/mink": "^1.7",
  "behat/mink-extension": "^2.2",
  "behat/mink-goutte-driver": "^1.2",
  "jcalderonzumba/mink-phantomjs-driver": "^0.3.3",
  "drupal/drupal-extension": "^3.3"
}
```
You can either copy that into your `composer.json` file and then run:

```bash
composer install
```

or you can grab each package separately:

* `composer require behat/behat --dev`
* `composer require behat/mink --dev`
* `composer require behat/mink-extension --dev`
* `composer require behat/mink-goutte-driver --dev`
* `composer require jcalderonzumba/mink-phantomjs-driver --dev`
* `composer require drupal/drupal-extension --dev`

Now we need to configure Behat:

* Make a tests directory in the root of your Drupal repo:

```bash
mkdir tests
```

* Change into the `tests` directory:

```bash
cd tests
```

* Inialize Behat:

```bash
../vendor/bin/behat --init
```

Replace `FeatureContext.php` with one that has Drupal Features
----

* Open the `tests/features/bootstrap/FeatureContext.php` file and erase the contents and replace with this:

```php
<?php

use Behat\Behat\Context\Context;
use Behat\Behat\Context\SnippetAcceptingContext;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Drupal\DrupalExtension\Context\MinkContext;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\Behat\Hook\Scope\AfterStepScope;

use Drupal\DrupalExtension\Context\RawDrupalContext;

/**
 * Define application features from the specific context.
 */
class FeatureContext extends RawDrupalContext implements Context, SnippetAcceptingContext {
  /**
   * Initializes context.
   * Every scenario gets its own context object.
   *
   * @param array $parameters
   *   Context parameters (set them in behat.yml)
   */
  public function __construct(array $parameters = []) {
    // Initialize your context here
  }

  /** @var \Drupal\DrupalExtension\Context\MinkContext */
  private $minkContext;
  /** @BeforeScenario */
  public function gatherContexts(BeforeScenarioScope $scope)
  {
      $environment = $scope->getEnvironment();
      $this->minkContext = $environment->getContext('Drupal\DrupalExtension\Context\MinkContext');
  }

//
// Place your definition and hook methods here:
//
//  /**
//   * @Given I have done something with :stuff
//   */
//  public function iHaveDoneSomethingWith($stuff) {
//    doSomethingWith($stuff);
//  }
//

    /**
     * Fills in form field with specified id|name|label|value
     * Example: And I enter the value of the env var "TEST_PASSWORD" for "edit-account-pass-pass1"
     *
     * @Given I enter the value of the env var :arg1 for :arg2
     */
    public function fillFieldWithEnv($value, $field)
    {
        $this->minkContext->fillField($field, getenv($value));
    }

    /**
     * @Given I wait for the progress bar to finish
     */
    public function iWaitForTheProgressBarToFinish() {
      $this->iFollowMetaRefresh();
    }

    /**
     * @Given I follow meta refresh
     *
     * https://www.drupal.org/node/2011390
     */
    public function iFollowMetaRefresh() {
      while ($refresh = $this->getSession()->getPage()->find('css', 'meta[http-equiv="Refresh"]')) {
        $content = $refresh->getAttribute('content');
        $url = str_replace('0; URL=', '', $content);
        $this->getSession()->visit($url);
      }
    }

    /**
     * @Given I have wiped the site
     */
    public function iHaveWipedTheSite()
    {
        $site = getenv('TERMINUS_SITE');
        $env = getenv('TERMINUS_ENV');

        passthru("terminus env:wipe $site.$env --yes");
    }

    /**
     * @Given I have reinstalled
     */
    public function iHaveReinstalled()
    {
        $site = getenv('TERMINUS_SITE');
        $env = getenv('TERMINUS_ENV');
        $site_name = getenv('TEST_SITE_NAME');
        $site_mail = getenv('ADMIN_EMAIL');
        $admin_password = getenv('ADMIN_PASSWORD');

        passthru("terminus --yes drush $site.$env -- --yes site-install standard --site-name=\"$site_name\" --site-mail=\"$site_mail\" --account-name=admin --account-pass=\"$admin_password\"'");
    }

    /**
     * @Given I have run the drush command :arg1
     */
    public function iHaveRunTheDrushCommand($arg1)
    {
        $site = getenv('TERMINUS_SITE');
        $env = getenv('TERMINUS_ENV');

        $return = '';
        $output = array();
        exec("terminus drush $site.$env -- " . $arg1, $output, $return);
        // echo $return;
        // print_r($output);

    }

    /**
     * @Given I have committed my changes with comment :arg1
     */
    public function iHaveCommittedMyChangesWithComment($arg1)
    {
        $site = getenv('TERMINUS_SITE');
        $env = getenv('TERMINUS_ENV');

        passthru("terminus --yes $site.$env env:commit --message='$arg1'");
    }

    /**
     * @Given I have exported configuration
     */
    public function iHaveExportedConfiguration()
    {
        $site = getenv('TERMINUS_SITE');
        $env = getenv('TERMINUS_ENV');

        $return = '';
        $output = array();
        exec("terminus drush $site.$env -- config-export -y", $output, $return);
    }

    /**
     * @Given I wait :seconds seconds
     */
    public function iWaitSeconds($seconds)
    {
        sleep($seconds);
    }

    /**
     * @Given I wait :seconds seconds or until I see :text
     */
    public function iWaitSecondsOrUntilISee($seconds, $text)
    {
        $errorNode = $this->spin( function($context) use($text) {
            $node = $context->getSession()->getPage()->find('named', array('content', $text));
            if (!$node) {
              return false;
            }
            return $node->isVisible();
        }, $seconds);

        // Throw to signal a problem if we were passed back an error message.
        if (is_object($errorNode)) {
          throw new Exception("Error detected when waiting for '$text': " . $errorNode->getText());
        }
    }

    // http://docs.behat.org/en/v2.5/cookbook/using_spin_functions.html
    // http://mink.behat.org/en/latest/guides/traversing-pages.html#selectors
    public function spin ($lambda, $wait = 60)
    {
        for ($i = 0; $i <= $wait; $i++)
        {
            if ($i > 0) {
              sleep(1);
            }

            $debugContent = $this->getSession()->getPage()->getContent();
            file_put_contents("/tmp/mink/debug-" . $i, "\n\n\n=================================\n$debugContent\n=================================\n\n\n");

            try {
                if ($lambda($this)) {
                    return true;
                }
            } catch (Exception $e) {
                // do nothing
            }

            // If we do not see the text we are waiting for, fail fast if
            // we see a Drupal 8 error message pane on the page.
            $node = $this->getSession()->getPage()->find('named', array('content', 'Error'));
            if ($node) {
              $errorNode = $this->getSession()->getPage()->find('css', '.messages--error');
              if ($errorNode) {
                return $errorNode;
              }
              $errorNode = $this->getSession()->getPage()->find('css', 'main');
              if ($errorNode) {
                return $errorNode;
              }
              return $node;
            }
        }

        $backtrace = debug_backtrace();

        throw new Exception(
            "Timeout thrown by " . $backtrace[1]['class'] . "::" . $backtrace[1]['function'] . "()\n" .
            $backtrace[1]['file'] . ", line " . $backtrace[1]['line']
        );

        return false;
    }

    /**
     * @AfterStep
     */
    public function afterStep(AfterStepScope $scope)
    {
        // Do nothing on steps that pass
        $result = $scope->getTestResult();
        if ($result->isPassed()) {
            return;
        }

        // Otherwise, dump the page contents.
        $session = $this->getSession();
        $page = $session->getPage();
        $html = $page->getContent();
        $html = static::trimHead($html);

        print "::::::::::::::::::::::::::::::::::::::::::::::::\n";
        print $html . "\n";
        print "::::::::::::::::::::::::::::::::::::::::::::::::\n";
    }

    /**
     * Remove everything in the '<head>' element except the
     * title, because it is long and uninteresting.
     */
    protected static function trimHead($html)
    {
        $html = preg_replace('#\<head\>.*\<title\>#sU', '<head><title>', $html);
        $html = preg_replace('#\</title\>.*\</head\>#sU', '</title></head>', $html);
        return $html;
    }
}
```

Add a `behat.yml` Config File
----

Inside your `tests` directory add this `behat.yml` config file:

```yaml
#
# behat.yml file for testing on Pantheon.
#
default:
  suites:
    default:
      paths:
        - %paths.base%/features
        - %paths.base%/site-features
      contexts:
        - FeatureContext
        - Drupal\DrupalExtension\Context\DrupalContext
        - Drupal\DrupalExtension\Context\MinkContext
  extensions:
    Behat\MinkExtension:
      goutte: ~
      selenium2: ~
      files_path: './data-files'
      base_url: http://ci-tutorial.lndo.site
    Drupal\DrupalExtension:
      blackbox: ~
      api_driver: 'drush'
      drush:
        root: /app
```

> #### Warning::Replace `base_url`
>
> Be sure to replace the `base_url` with the URL to your Lando app.

Writing Some Behat Tests
-----

We need some Behat tests to run. You can of course write any Behat tests you like, but I'll provide some simple ones here:

* check to see that we can get the homepage (@homepage)
* check that an Administrator can login (@loggedin)

Creat a new file in `tests/features` and name it `content.feature` and paste in the following:

```yaml
Feature: Content
  In order to test some basic Behat functionality
  As a website user
  I need to be able to see that the Drupal and Drush drivers are working

  @gff
  Scenario: Test the homepage
    When I go to "/"
    Then I should see "Welcome to CI Tutorial"

  @api @loggedin
  Scenario: Logged in as an Administrator
    Given I am logged in as a user with the "administrator" role
      When I go to "/"
      Then I should see "Log out"

```

> #### Warning::Replace "Welcome to CI Tutorial"`
>
> I named my Drupal App "CI Tutorial"; so if you named yours differently be sure
> to replace with your site name.

Set up `composer.json` to Run Behat Tests
-----

Wow; that is a lot of stuff; almost there.  Now open your `composer.json` file and look for the `scripts` key (if there is not a `scripts` section add one) and add a line to run the Behat tests. Here is the `scripts` section of my `composer.json` file:

```json
"scripts": {
  "pre-autoload-dump": "Drupal\\Core\\Composer\\Composer::preAutoloadDump",
  "post-autoload-dump": [
    "Drupal\\Core\\Composer\\Composer::ensureHtaccess"
  ],
  "post-package-install": "Drupal\\Core\\Composer\\Composer::vendorTestCodeCleanup",
  "post-package-update": "Drupal\\Core\\Composer\\Composer::vendorTestCodeCleanup",
  "test": [
    "./vendor/bin/phplint --configuration=./.phplint.yml --no-cache --exclude=contrib modules/custom"
  ],
  "behat": [
    "cd tests && ../vendor/bin/behat --config=behat.yml --tags @homepage,@loggedin"
  ]
},
```
Notice the `"behat"` key that reads in the `behat.yml` config and runs the `--tags @homepage,@loggedin` in Behat tests.

Now to run your tests locally change to the root of your project (where the `composer.json` file lives) and type:

```bash
lando composer behat
```

Configure `.travis.yml` to Authenticate and Pull in DB
-----

Great! Now to get these to run on Travis we have to assure there is running Drupal app with the Database not just the code to run the tests against.

* Add a `travis` directory

```bash
mkdir travis
```

* Add a `settings.local.php` file to the `travis` directory so we can move it into place on the Travis CI automated testing environment:

```php
<?php

$databases['default']['default'] = array (
  'database' => 'pantheon',
  'username' => 'pantheon',
  'password' => 'pantheon',
  'host' => 'database',
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
  'collation' => 'utf8mb4_general_ci',
);

```

* Add your `.travis.yml` file:

* Create an access token on your Pantheon Dashboard
* Encrypt the token with the `travis` gem
  * `travis encrypt TRAVISCITOKEN='{PASTE_IN_TOKEN_FROM_PANTHEON}'  -r {serundeputy/ci-tutorial}`
    * replace the `{serundeputy/ci-tutorial}` with your apps GitHub repo
  * Take the output from that command and add it to the `env:` key in your `.travis.yml` file like the example below:
* The encrtypted token allows us to login into Pantheon with `terminus` and pull in a DB to run our Behat tests against
* The management of the composer packages, Drupal site, terminus are all handled by installing Lando on the Travis environment; then calling all the tools when necessary.

Here is the full `.travis.yml` file:

```yaml
language: php
php:
- '7.0'
services:
- docker

env:
  global:
    secure: a2uFRYTdRT6KqTTHSp97pqp+Dna1tQY9i5FVNHcBlwksEpViVXI3TxoXh1sB4szcqVflxrjnpYWycy4RTKYWr+Nhv4yMV5FmrLQ8iJM7MCSEQYP14HsQXTj6B8pA9sMFq7+qIgzOnJ/BwUh4YTrSAFXfeulE4PA0C+Nz55TUCqaB2B0Hvq6lD6gdQade99Yqeh6zeXZbtAaB0sEjZmQ/idGyC0vmSxTbdCOc9AzPwszdCrDxYJ+VCX+OjIgH+Y4i2NddMtlOs/mrHRck4xxMfjVuTLtLeUQlPaXIJM2MHQU9KY9itZDsNZE3bmJF4PwZ/7Yw7M4peR73t+ZxTSpxshKVovmXkdjeqzMiduvu7cpUJzmjCtEbrfWNesVtnwz2RfxgeEhZhpjb6UhTP2FEwD7L0P5gzQPgqvxNBLEBleWVVQrNuD0a4oEI+YP1evcjEnMRtlfUqskb5N379HIjZRmqthrle+V1fvFLqWA67hgIc5gz22DRA1l+RA6alCiGtUQJ92okc3/FVjNpR9OE2viWRc5kilP+xQX0tlOpRd+pmb185KCNvAzPTowpX5nI9SmJrJlNeFJbkk2A75TdiSdYfZEJkKECrn8yM6Sli+M0gr8IJ26WMMX58mvXVXr5NM9ve1iOzru24RZhuur85wgj+kmB1rS5uGCWo6fHG3A=

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
- cp travis/settings.local.php sites/default/settings.local.php

# Get the DB and install.
- lando terminus auth:login --machine-token=$TRAVISCITOKEN
- lando terminus backup:create ci-tutorial.dev --element=db
- lando terminus backup:get ci-tutorial.dev --element=db --to=/app/db.sql.gz
- lando db-import db.sql.gz

# Check if we can bootstrap the site.
- lando drush cr | grep "rebuild complete."

# Run phplint codecheck.
- lando composer test

# Run Behat tests.
- lando composer behat

```

Now each branch you push up to your GitHub repo and fire off a PR for will:

* Spin up a Travis environment
* Install Lando
* Install all composer dependencies (including Behat)
* Install your Drupal site, get the DB, and run all the tests you define such as the line:

```yaml
# Run Behat tests.
- lando composer behat
```

Happy dev, happy code, happy life: :)

Full Example
------------

`.lando.yml`:

{% codesnippet "./../examples/lando-ci-and-behat/.lando.yml" %}{% endcodesnippet %}

`composer.json`:

{% codesnippet "./../examples/lando-ci-and-behat/composer.json" %}{% endcodesnippet %}

`.travis.yml`:

{% codesnippet "./../examples/lando-ci-and-behat/.travis.yml" %}{% endcodesnippet %}
