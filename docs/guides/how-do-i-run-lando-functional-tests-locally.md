---
title: How do I run Lando Functional Tests locally?
metaTitle: How do I run Lando Tests locally? | Lando
description: Testing lando locally with yarn, leia, and mocha.
summary: Testing lando locally with yarn, leia, and mocha.
date: 2020-03-30T17:55:36.962Z
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

# How do I run Lando Functional Tests locally?

<GuideHeader test="" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

Running the Lando functional tests can take a lot of system resources and in development it can be convenient to run just the test you care about or run several tests one at a time.

After editing or making a new test in one of the `example/*/README.md` files you first need to regenerate the tests:

```bash
yarn generate-tests
```

This will use `leia` to convert the `README.md` test steps into mocha functional tests in the `tests/` directory.

To run the tests use `mocha` like so:

```bash
yarn mocha --timeout 900000 test/php-example.func.js
```

Replace `php-example.func.js` with the file you are interested in testing.

Further deep dive reading: [Lando Docs Functional Testinng](https://docs.lando.dev/contrib/contrib-testing.html#functional-tests)

<GuideFooter test="" original="" repo=""/>
<Newsletter />
