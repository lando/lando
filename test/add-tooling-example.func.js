/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: add-tooling-example
 * runs-from: ../examples/addtools
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('add-tooling-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start the augmented tools example', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando start').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  // These tests are the main event
  // @todo: It would be nice to eventually get these into mocha after hooks
  // so they run after every test
  it('verify that we have nginx instead of apache', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('docker ps | grep addtools_nginx_1').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our php version', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando php -v | grep PHP | grep 7.1.2').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the phpunit cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando phpunit --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have composer', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando composer --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we can access the db with our custom user password and db', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando mysql -u lemp -plemp lemp -e"quit"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the git cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando git --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the phantomjs cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando phantomjs -v').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('destroy the app', done => {
    process.chdir(path.resolve(__dirname, '../examples/addtools'));
    const cli = new CliTest();
    cli.exec('lando destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });
});
