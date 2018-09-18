/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: php-apache-services-example
 * src: examples/lamp
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('lamp', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('starts up a lamp stack using lando services', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js start').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  // These tests are the main event
  // @todo: It would be nice to eventually get these into mocha after hooks
  // so they run after every test
  it('verify that we are being served by apache', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "curl -Ik https://localhost | grep Server | grep Apache"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the php cli exists and has the right version', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js php -v | grep 5.3.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the webroot is set correctly', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "env | grep LANDO_WEBROOT=/app/www"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we have the xdebug extension', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js php -m | grep Xdebug').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify mysql portforward', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('docker inspect lamp_database_1 | grep HostPort | grep 3308 && node ../../bin/lando.js info | grep port | grep 3308').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the databases was setup correctly', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh database -c "mysql -ulamp -plamp lamp -e\"quit\""').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we have the composer tool', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js composer --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we have the mysql cli', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js mysql -V').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('destroys the lamp stack', done => {
    process.chdir('examples/lamp');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });
});
