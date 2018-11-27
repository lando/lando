/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: word-press-composer-example
 * runs-from: ../examples/wordpress
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('word-press-composer-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start word press', done => {
    process.chdir(path.resolve(__dirname, '../examples/wordpress'));
    const cli = new CliTest();
    cli.exec('if [ -d "web" ]; then rm -Rf web; fi && lando start && lando composer install && cp config/wp-config.php web/wp-config.php').then(res => {
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
  it('test getting word press codebase via composer', done => {
    process.chdir(path.resolve(__dirname, '../examples/wordpress'));
    const cli = new CliTest();
    cli.exec('lando composer install').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have a word press codebase', done => {
    process.chdir(path.resolve(__dirname, '../examples/wordpress'));
    const cli = new CliTest();
    cli.exec('ls web |grep index.php').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify copy of wp config php file', done => {
    process.chdir(path.resolve(__dirname, '../examples/wordpress'));
    const cli = new CliTest();
    cli.exec('cp config/wp-config.php web/wp-config.php').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test installing word press via wp cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/wordpress'));
    const cli = new CliTest();
    cli.exec('lando wp core install --path=web --url=wordpress.lndo.site --admin_user=root --admin_email=gff@gff.gov --title=WordPressLando').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that we can access the homepage', done => {
    process.chdir(path.resolve(__dirname, '../examples/wordpress'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "curl nginx |grep \'Welcome to WordPress. This is your first post. Edit or delete it, then start writing!\'"').then(res => {
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
  it('remove the test word press app', done => {
    process.chdir(path.resolve(__dirname, '../examples/wordpress'));
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
