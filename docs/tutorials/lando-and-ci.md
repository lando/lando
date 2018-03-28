Using Lando with a CI Service
=============================

In this example we will spin up a Lando LEMP app and add a `.travis.yml` config file to demonstrate how to use Lando in conjunction with a Continuous Integration (CI) service. In practice this could be Travis CI, Circle CI, or any CI provider but this example will use Travis CI.

This will be a barebones example that does basic php linting.

Start with a Lando app
----------------------

We will assume the user already has a Lando app rolling. For this example we will use the following:

{% codesnippet "./../examples/lando-and-ci/.lando.yml" %}{% endcodesnippet %}

Note that we've configure our lando app in two special ways.

1.  It will run `composer install` when it is being built
2.  It defines a wrapper `lando test` command that can aggregate lower levels test commands eg `composer test`

Define Some Tests Normally
--------------------------

In this example we are doing some basic `phplint`ing. We can get the `phplint` tools via `composer`.

```bash
composer require overtrue/phplint --dev
```

Now you can also add a `scripts` key to you `composer.json` file like so:

{% codesnippet "./../examples/lando-and-ci/.lando.yml" %}{% endcodesnippet %}

This will allow you to lint your code by running `composer test`. Note that this requires you use a `.phplint.yml`. Here is an example `.phplint.yml`

{% codesnippet "./../examples/lando-and-ci/.phplint.yml" %}{% endcodesnippet %}

And the full `composer.json`.

{% codesnippet "./../examples/lando-and-ci/composer.json" %}{% endcodesnippet %}

You should now be able to run your tests

```bash
# `lando test` will only work if you've explicitly defined that in your `.lando.yml`
# As in this example
lando test || lando composer test
```

Lando-ify your .travis.yml
--------------------------

We will assume the user is knowledgable and comfortable about setting up a [project on Travis](https://docs.travis-ci.com/user/getting-started/). On a high level your travis file will want to do three things

1.  Install the linux version of lando
2.  Start your lando app
3.  Run your test command

Here is a `.travis.yml` file that accomplishes the above for our current example.

{% codesnippet "./../examples/lando-and-ci/.travis.yml" %}{% endcodesnippet %}

> #### Warning::This Lando download is bleeding edge
>
> If you need a stable Lando release, it's best to peg your version to an
> [official release](https://github.com/lando/lando/releases).

That's great! More importantly though now each time we file a PR against the GitHub repo it will:

*   Spin up a Travis CI environment
*   Install Lando on Travis
*   Install composer dependencies
*   Run the phplint code check

If the CI checks pass you can merge with confidence!

Full Example
------------

You can check out the full code for this example [over here](https://github.com/lando/lando-ci-example).
