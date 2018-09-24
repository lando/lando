/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: word-press-composer-example
 * src: examples/wordpress
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('wordpress', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start word press', done => {
    process.chdir('examples/wordpress');
    const cli = new CliTest();
    cli.exec('if [ -d "web" ]; then rm -Rf web; fi && node ../../bin/lando.js start && node ../../bin/lando.js composer install && cp config/wp-config.php web/wp-config.php').then(res => {
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
  it('test getting word press codebase via composer', done => {
    process.chdir('examples/wordpress');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js composer install').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we have a word press codebase', done => {
    process.chdir('examples/wordpress');
    const cli = new CliTest();
    cli.exec('ls web |grep index.php').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify copy of wp config php file', done => {
    process.chdir('examples/wordpress');
    const cli = new CliTest();
    cli.exec('cp config/wp-config.php web/wp-config.php').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test installing word press via wp cli', done => {
    process.chdir('examples/wordpress');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js wp core install --path=web --url=wordpress.lndo.site --admin_user=root --admin_email=gff@gff.gov --title=WordPressLando').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify that we can access the homepage', done => {
    process.chdir('examples/wordpress');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "curl nginx |grep \'Welcome to WordPress. This is your first post. Edit or delete it, then start writing!\'"').then(res => {
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
  it('remove the test word press app', done => {
    process.chdir('examples/wordpress');
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
