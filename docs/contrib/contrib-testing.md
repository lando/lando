---
description: Learn about how to contribute to Lando by testing from source.
---

# Testing

You should be able to use this guide as follows:

1.  Check code linting and style
2.  Run and write unit tests
3.  Run and write functional tests
4.  Learn how to write tests

## Code linting and standards

Lando implements some basic linting and a slightly less annoying version of the `google` `es6` code standards to make sure things remain consistent between developers and to prevent syntax errors. You can easily check whether your code matches these standards using grunt.

```bash
# For lando proper
yarn lint

# For the docs and website
yarn lint:sites
```

## Unit tests

The unit tests use [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/).

In order to familiarize yourself with where tests should live for both core and plugins, please consult the [structure guide](./structure.md). Lando's core libraries currently have decent coverage so you can [scope them out](https://github.com/lando/lando/tree/master/test/unit) for help writing tests.

To run the unit test suite, execute the following:

```bash
yarn test:unit
```

## Functional tests

Lando uses it's own functional testing framework called [leia](https://github.com/lando/leia). Leia helps us ensure that Lando is the real hero we all know him to be.

Leia combines `mocha` as the test runner, `chai` for assertions and `command-line-test` to make the process of executing commands simpler. Tests are written as specially structured `README.md` files that live in the `examples` folder and contain code blocks. When the suite runs, these are scanned, parsed and outputted as mocha tests.

::: danger Pretty sure these will not run on Windows yet!!!
SORRY WINDOZE USERS!
::::

To generate tests from the `examples` repo and then run the functional test suite, execute the following:

```bash
yarn generate:tests && yarn test:functional
```

**NOTE:** This may take awhile to complete locally and could destroy any apps you may already have running. It's best to use it in a continuous integration environment.

To better understand how these `markdown` files need to be parsed, check out the [Leia docs](https://github.com/lando/leia). Lando will specifically look for headers to determine which kinds of tests your code block is for and start with the following:

| Type | Headers |
| -- | -- | -- |
| Start | `Starting`|
| Test | `Testing` |
| Cleanup | `Cleaning` |

### Running Functional Tests One at a Time

Running the Lando functional tests can take a lot of system resources and in development it can be convenient to run just the test you care about or run several tests one at a time.

After editing or making a new test in one of the `example/*/README.md` files, you first need to regenerate the tests as follows:

```bash
yarn generate:tests
```

This will use `leia` to convert the `README.md` test steps into mocha functional tests in the `tests/` directory.

To run the tests, use `mocha` like below:

```bash
yarn mocha --timeout 900000 test/php-example.func.js
```

Replace `php-example.func.js` with the file you are interested in testing.


Some caveats and general guidelines about when and how to write functional tests are shown below:

### So what's the catch?

1. The suite will run against the `lando` it finds in your PATH so you need to make sure that `lando` is running from source
2. For test commands to pass, they must return a 0 status code e.g. not have any errors
3. Additional quotes inside of a `lando ssh -c "STUFF"` are not handled very well right now

### So when does your code need to include functional tests?

When you are fixing a bug, you should first write a test to confirm the bug exists repeatably. Then you can fix the bug and the test should pass. Because this framework is essentially just running a bunch of Lando and/or Docker commands, it should be pretty easy to write out steps to replicate using the framework.

### When shouldn't you bother with a new functional test?

1. Your PR is docs only
2. Your PR is outside the critical path (e.g. writing tests or altering our build pipeline)
3. Your code alters Lando in a way that doesn't alter the 'contract' with the user. Internal refactoring should add or alter appropriate unit tests, but if the net affect is not visible to an end user, it doesn't need a functional test.

## References

In addition to the tips above, looking at existing tests will give you a good idea of how to write your own, but if you're looking for more tips, we recommend the following:

*	[Leia](https://github.com/lando/leia)
*   [Mocha documentation](http://mochajs.org/)
*   [Chai documentation](http://chaijs.com/)
*   [Chai-As-Promised documentation](http://chaijs.com/plugins/chai-as-promised/)
*	[Command Line Test](https://github.com/macacajs/command-line-test)
*   [Lando core unit tests](https://github.com/lando/lando/tree/master/test)

