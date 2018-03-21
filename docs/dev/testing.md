# Testing

You should be able to use this guide to...

1.  Check code style
2.  Run unit tests
3.  Run functional tests
4.  Learn how to write tests

## Code linting and standards

Lando implements some basic linting and code standards to make sure things remain consistent between developers and to prevent syntax errors. You can easily check whether your code matches these standards using grunt.

```bash
yarn lint
```

## Unit tests

The unit tests use [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/).

To run the unit test suite, execute:

```bash
yarn test:unit
```

We *need* to increase unit test coverage, there aren't significant examples to review at the present time. Standard mocha/chai patterns will be the norm here.

## Functional tests
To run the functional suite, execute:

```bash
yarn test:functional
```

The functional test suite also uses mocha as the test runner and chai for assertions. Additionally, all functional tests for cli functionality are using [command-line-test](https://github.com/macacajs/command-line-test) to make the process of executing Lando simpler.

Most functional specs will do something like this:

```js
describe('Some part of Lando', function() {
  this.timeout(50000); // Functional tests are slow...
  // before my specific test suite...but only once, not on _each_ test...
  before(function() {
    // We sometimes need to inspect Docker environment directly
    this.docker = new Docker();
    // Where is Lando's bin script relative to this file?
    this.executable = path.resolve(
      __dirname, '..', 'bin', 'lando.js' // this will change based on file path
    );
  });

  // Get a fresh CLI command object before each test.
  beforeEach(function() {
    // We'll need this in all tests
    this.cliTest = new CliTest();
  });

  describe('#thinginmycode', function() {
    // Maybe run a before block and store the cmd output to run it once
    // and assert against it several times...
    before(function() {
      //The command runs once and we store a promise so we can assert against it
      // in each spec
      this.cmd = this.cliTest.execFile(
        this.executable, 'rescue Han', {cwd: 'tatooine'}
      );
    });

    it('regrets what it did to Han', function() {
      return this.cmd.then(function(res) {
        return res.should.not.include('death by sarlacc pit');
      });
    });
  });
});
```

There are a few patterns to note here:

1. We're storing the entrypoint script's path to run in each test.
2. We're attempting to run each command under test only a single time, and then build multiple specs and assertions off of the return of that command to help minimize the runtime of the suite.
3. We're using two methods of testing the commands:
  1. We're checking the stdout/stderr of the CLI commands. This is brittle but helps to ensure consistent output
  2. Using Dockerode to directly inspect the state of our containers where possible
4. Tests are organized to live as close to their command definitions as possible. We don't currently have functional tests in the top level test folder, this may change as the suite grows.

### So when does your code need to include functional tests?

1. When you are fixing a bug, you should first write a test to confirm the bug exists repeatably, then you can fix the bug, and the test should pass.
2. If you add code that alters the 'contract' with the user, as in altering the available commands and/or options or output. Relevant tests should be created or updated.

### When shouldn't you bother with a new functional test?

1. Your PR is docs only
2. Your PR is outside the critical path (writing tests, altering our build pipeline)
3. Your code alters Lando in a way that doesn't alter the 'contract' with the user. Internal refactoring should add or alter appropriate unit tests, but if the net affect is not visible to an end user, it doesn't need a functional test.

Writing Tests
-------------

Tests reside in the `/test` folder in the root of the project and there are separate test folders in each plugin directory. The folder patterns in each plugin are identical to the patterns in the root. For examples of unit tests look for `*.spec.js` files in the `unit` sub-folder. For examples of functional tests look for `*.spec.js` files in the `functional/cli` sub-folder.

In addition to the tips above, looking at existing tests will give you a good idea of how to write your own, but if you're looking for more tips, we recommend:

*   [Mocha documentation](http://mochajs.org/)
*   [Chai documentation](http://chaijs.com/)
*   [Chai-As-Promised documentation](http://chaijs.com/plugins/chai-as-promised/)
