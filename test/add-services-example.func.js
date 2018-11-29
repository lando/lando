/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: add-services-example
 * runs-from: ../examples/addservices
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('add-services-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start the augmented services example', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
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
  it('verify our php version', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando php -v | grep PHP | grep 7.1.2').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our custom php mem limit', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando php -i | grep memory_limit | grep 1023M').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the phpunit cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando phpunit --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we can access the db with our custom user password and db', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando mysql -u tswift -ptroubletroubletrouble songz -e"quit"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our db portforward is dialed', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('docker inspect addservices_database_1 | grep HostPort | grep 1337 && lando info | grep 1337').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the node cli at the correct version', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando node -v | grep v6.10.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have npm', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando npm -v').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have gulp', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando gulp -v').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have vim', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('lando vim --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that redis was started in append only mode', done => {
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
    const cli = new CliTest();
    cli.exec('docker inspect addservices_cache_1 | grep appendonly').then(res => {
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
    process.chdir(path.resolve(__dirname, '../examples/addservices'));
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
