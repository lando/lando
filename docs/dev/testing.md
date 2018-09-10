Testing
=======

You should be able to use this guide to...

1.  Check code linting and style
2.  Run and write unit tests
3.  Run and write functional tests
4.  Learn how to write tests

Code linting and standards
--------------------------

Lando implements some basic linting and a slghtly less annoying version of the `google` `es6` code standards to make sure things remain consistent between developers and to prevent syntax errors. You can easily check whether your code matches these standards using grunt.

```bash
yarn lint
```

Unit tests
----------

The unit tests use [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/). In order to familiarize yourself with where tests should live for both core and plugins please consult the [structure guide](./structure.md). Lando's core libraries currently have 100% coverage so you can [scope them out](https://github.com/lando/lando/tree/master/test/unit) for help writing tests.

To run the unit test suite, execute:

```bash
yarn test:unit
```

Functional tests
----------------

Lando uses it's own functional testing framework that combines mocha as the test runner, chai for assertions and [command-line-test](https://github.com/macacajs/command-line-test) to make the process of executing commands simpler. Tests are written as specially structured `markdown` files that live in the `examples` folder and contain code blocks. When the suite runs these are scanned, parsed and outputted as mocha tests.

To run the functional test suite, execute:
```bash
yarn test:functional
```

> #### Warning::Pretty sure these will not run on Windows yet
>
> SORRY WINDOZE USERS!

In order for your `markdown` file to be recognized as a functional test it needs to have at least the following

#### 1. A H1 Header

```md
ISSUE NUMBER - Brief description
================================
```

#### 2. Three H2 Headers

Our parser will look for three sections that contain instructions for installing needed test dependencies, the actual tests to run and instructions for how to cleanup after the tests run. These sections **must be begin** with the following words in order to be picked up by our parser and they are **case sensitive**

```md
Starting
--------

... instructions

Testing
-------

... instructions

Cleanup
-------

... instructions
```

If you want to have MOARFUN with how you describe these sections, check out the other [starting phrases](https://github.com/lando/lando/blob/master/scripts/util.js#L11) we look for to identify each section.

#### 3. A code block with at least one command and comment

Under each of the above sections you need to have a triple tick [markdown code block](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code) that contains at least one comment and one command. The comment will be the human readable description of what the test does.

Here is a basic code block that runs one test

```bash
# Start up my example with lando
lando start
```

Here is another block with a more verbose comment

```bash
# Check to see if our app has the gd php extension installed
# ADDITIONAL LINES OF COMMENTS ARE PERMITTED BUT ONLY THE FIRST LINE WILL BE
# USED AS THE TEST DESCRIPTION
lando php -m | grep gd
```

Here is an example that runs multiple tests. Note that you **MUST** drop a new line between the first and second test for it to read both.

```bash
# Destroy my lando app
lando destroy -y

# Test whether truth really exists
true
```

Here is an example that runs a multi line command. Note that these commands are concatenated together with `&&` behind the scenes.

```bash
# Do something a little more complicted
lando db-import test.sql
lando mysql data1 -e "show tables;" | grep users
```

Here is a [complete functional test](https://github.com/lando/lando/tree/master/examples/1141-freetype-fpm5.3) we wrote to replicate and then fix [#1141](https://github.com/lando/lando/issues/1141). This test actually runs in production on every code push. A good deal of our [examples](https://github.com/lando/lando/tree/master/examples) are also valid functional tests.

Here are some caveats and general guidelines about when and how to write tests.

#### So what's the catch?

1. You can only run functional tests from the lando source root directory.
2. For test commands to pass they must return a 0 status code eg not have any errors
3. Additional quotes inside of a `lando ssh -c "STUFF"` are not handled very well right now

#### So when does your code need to include functional tests?

When you are fixing a bug, you should first write a test to confirm the bug exists repeatably, then you can fix the bug, and the test should pass. Because this framework is essentially just running a bunch of Lando and/or Docker commands it should be pretty easy to write out steps to replicate using the framework.

#### When shouldn't you bother with a new functional test?

1. Your PR is docs only
2. Your PR is outside the critical path (writing tests, altering our build pipeline)
3. Your code alters Lando in a way that doesn't alter the 'contract' with the user. Internal refactoring should add or alter appropriate unit tests, but if the net affect is not visible to an end user, it doesn't need a functional test.

References
----------

In addition to the tips above, looking at existing tests will give you a good idea of how to write your own, but if you're looking for more tips, we recommend:

*   [Mocha documentation](http://mochajs.org/)
*   [Chai documentation](http://chaijs.com/)
*   [Chai-As-Promised documentation](http://chaijs.com/plugins/chai-as-promised/)
*   [Lando core unit tests](https://github.com/lando/lando/tree/master/test/unit)
*   [Lando engine plugin unit tests](https://github.com/lando/lando/tree/master/plugins/lando-engine/test/unit)
*   [Functional test for issue #1141](https://github.com/lando/lando/tree/master/examples/1141-freetype-fpm5.3)
