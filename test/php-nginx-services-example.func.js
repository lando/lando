/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: php-nginx-services-example
 * runs-from: ../examples/lemp
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('php-nginx-services-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('starts up a lemp stack using lando services', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
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
  it('verify that we are being served securely by nginx', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl -Ik https://nginx | grep Server | grep nginx"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the php cli exists and has the right version', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando php -v | grep 7.1.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the webroot is set correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "env | grep LANDO_WEBROOT=/app/www"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the xdebug extension', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando php -m | grep Xdebug').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the databases was setup correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -umariadb -ppassword database -e\"quit\""').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify mysql portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('docker inspect lemp_database_1 | grep HostPort | grep 3332 && lando info | grep port | grep 3332').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the composer tool', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando composer --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the mysql cli and its using mariadb', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando mysql -V | grep MariaDB').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the mysql cli and its the right version', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando node -v | grep 6.10').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the phplint cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando phplint --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our custom php settings', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando php -i | grep memory_limit | grep 499M').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the custom db file was used', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -u root -e \'show variables;\' | grep key_buffer_size | grep 4026"').then(res => {
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
  it('destroys the lemp stack', done => {
    process.chdir(path.resolve(__dirname, '../examples/lemp'));
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
