Testing
=======

You should be able to use this guide to...

  1. Check code styling and linting
  2. Run tests
  3. Learn how to write tests

Code linting and standards
--------------------------

Lando implements some basic linting and code standards to make sure things remain consistent between developers and to prevent syntax errors. You can easily check whether your code matches these standards using grunt.

```bash
grunt test:code
```

Unit tests
----------

The unit tests use [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/).

```bash
grunt test:unit
```

Functional tests
----------------

The installer tests use the [BATS framework](https://github.com/sstephenson/bats).

> #### Danger::USE EXTREME CAUTION
>
> If you run these tests on a machine that already has Kalabox installed it is most likely going to wipe away your currently installed version of Kalabox. For that reason please **BE CAREFUL USING THIS!!!**

```bash
grunt bats
```

Writing Tests
-------------

Tests reside in the `test` folder. For examples of unit tests look for `*.spec.js` files in the `unit` folder. For examples of functional tests look for `*.bats` files in the `bats` folder.

Looking at existing tests will give you a good idea of how to write your own, but if you're looking for more tips, we recommend:

* [Mocha documentation](http://mochajs.org/)
* [Chai documentation](http://chaijs.com/)
* [Chai-As-Promised documentation](http://chaijs.com/plugins/chai-as-promised/)
* [BATS wiki](https://github.com/sstephenson/bats)
* [BATS tutorial](https://blog.engineyard.com/2014/bats-test-command-line-tools)
