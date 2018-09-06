const chai = require('chai');
const CliTest = require('command-line-test');
chai.should();

describe('test', function() {
  it('constructor should be ok', function() {
    CliTest.should.be.ok;
  });

  it('test out the promise', function(done) {
    const cliTest1 = new CliTest();
    cliTest1.exec('cat /Users/pirog/Desktop/work/lando/package.json').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('run lando version', function(done) {
    const cliTest1 = new CliTest();
    cliTest1.exec('node /Users/pirog/Desktop/work/lando/bin/lando.js version2').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('starts the apache example', function(done) {
    const cliTest1 = new CliTest();
    process.chdir('/Users/pirog/Desktop/work/lando/examples/apache');
    cliTest1.exec('node /Users/pirog/Desktop/work/lando/bin/lando.js start').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('destroys the apache example', function(done) {
    const cliTest1 = new CliTest();
    process.chdir('/Users/pirog/Desktop/work/lando/examples/apache');
    cliTest1.exec('node /Users/pirog/Desktop/work/lando/bin/lando.js destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });
});
