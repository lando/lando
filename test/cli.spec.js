/**
 * Tests for plugin system.
 * @file plugins.spec.js
 */

'use strict';

// Setup chai.
const _ = require('lodash');
const art = require('./../lib/art');
const Table = require('./../lib/table');
const chai = require('chai');
const Cli = require('./../lib/cli');
const sinon = require('sinon');
chai.use(require('chai-as-promised'));
chai.should();

// Take task
const fakeTask = {
  command: 'task [arg1]',
  describe: 'Does the thing on the [appname]',
  options: {
    list: {
      describe: 'list some datas',
      alias: ['l'],
      array: true,
    },
    yes: {
      describe: 'ask me if i am ok',
      alias: ['y'],
      default: false,
      boolean: true,
      interactive: {
        type: 'confirm',
        default: false,
        message: 'Are you ok?',
      },
    },
    other: {
      describe: 'some other thing',
      string: true,
      interactive: {
        type: 'input',
        message: 'what is it?',
        default: 'nothing',
        weight: 4,
      },
    },
  },
  run: options => options,
};

// This is the file we are testing
describe('cli', () => {
  describe('#Cli', () => {
    it('should return a Cli instance with correct default options', () => {
      const cli = new Cli();
      cli.should.be.instanceof(Cli);
      cli.should.have.property('prefix', 'LANDO');
      cli.should.have.property('logLevel', 'warn');
      cli.should.have.property('userConfRoot').and.not.be.empty;
    });

    it('should return a Cli instance with custom options', () => {
      const prefix = '16309';
      const logLevel = 'allthelogz';
      const userConfRoot = '/tmp';
      const cli = new Cli(prefix, logLevel, userConfRoot);
      cli.should.be.instanceof(Cli);
      cli.should.have.property('prefix', prefix);
      cli.should.have.property('logLevel', logLevel);
      cli.should.have.property('userConfRoot', userConfRoot);
    });
  });

  describe('#argv', () => {
    it('should be the same as yargs.argv', () => {
      const cli = new Cli();
      cli.argv().should.deep.equal(require('yargs').argv);
    });
  });

  describe('#checkPerms', () => {
    it('should be the same as sudoBlock', () => {
      const cli = new Cli();
      cli.checkPerms();
    });
  });

  describe('#defaultConfig', () => {
    it('should return default config object that can be used to bootstrap a lando cli', () => {
      const cli = new Cli();
      const config = cli.defaultConfig();
      const types = {
        string: [
          'domain',
          'envPrefix',
          'landoFile',
          'logLevelConsole',
          'logDir',
          'mode',
          'product',
          'userAgent',
          'userConfRoot',
          'version',
        ],
        array: ['configSources', 'pluginDirs'],
      };
      _.forEach(types, (props, type) => {
        _.forEach(props, prop => {
          config[prop].should.be.a(type);
        });
      });
      config.mode.should.equal('cli');
    });

    it('should set log level from argv() if set', () => {
      const cli = new Cli();
      sinon.stub(cli, 'argv').returns({v: 3, verbose: 3});
      const config = cli.defaultConfig();
      config.logLevelConsole.should.equal(4);
      cli.argv.restore();
    });
  });

  describe('#makeArt', () => {
    it('should be the same as art()', () => {
      const cli = new Cli();
      const func = 'updateAvailable';
      const opts = {url: 'https://lando.dev'};
      cli.makeArt(func, opts).should.deep.equal(art[func](opts));
    });
  });

  describe('#makeTable', () => {
    it('should be the same as new Table()', () => {
      const cli = new Cli();
      cli.makeTable().should.deep.equal(new Table());
    });
  });

  describe('#parseToYargs', () => {
    it('should return an object that yargs can use', () => {
      const cli = new Cli();
      const task = cli.parseToYargs(fakeTask);
      task.command.should.be.a('string');
      task.describe.should.be.a('string');
      task.builder.should.be.an('object');
      task.handler.should.be.a('function');
    });
  });

  describe('#run', () => {
    it('should return a yargs cli', () => {
      const cli = new Cli();
      const task = cli.parseToYargs({command: 'task', describe: 'desc'});
      cli.run([task]);
    });
  });
});
