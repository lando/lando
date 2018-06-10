/**
 * Tests for plugin system.
 * @file plugins.spec.js
 */

'use strict';

// Setup chai.
const _ = require('lodash');
const art = require('./../../lib/art');
const AsyncEvents = require('./../../lib/events');
const Table = require('../../lib/table');
const chai = require('chai');
const Cli = require('./../../lib/cli');
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
        string: ['envPrefix', 'logLevelConsole', 'logDir', 'mode', 'userConfRoot', 'version'],
        array: ['configSources', 'pluginDirs'],
      };
      _.forEach(types, (props, type) => {
        _.forEach(props, prop => {
          config[prop].should.be.a(type);
        });
      });
      config.mode.should.equal('cli');
    });

    it('should set log level from global opts if set', () => {
      const cli = new Cli();
      sinon.stub(cli, 'largv').returns({v: 3, verbose: 3});
      const config = cli.defaultConfig();
      config.logLevelConsole.should.equal(4);
      cli.largv.restore();
    });
  });

  describe('#largv', () => {
    it('should return "empty" parse yargs with verbosity 0 by default', () => {
      const cli = new Cli();
      const result = {_: [], v: 0, verbose: 0};
      cli.largv().should.deep.equal(result);
    });

    it('should return all parsed args after the -- regardless of what comes before', () => {
      const cli = new Cli();
      const result = {_: [], verbose: 1, v: 1, help: true, h: true, thing: true};
      const largv1 = cli.largv(['--daddy', 'ward', '--', '--verbose', '--help', '--thing', 'stuff']);
      const largv2 = cli.largv(['--', '--verbose', '--help', '--thing', 'stuff']);
      largv1.should.deep.equal(result);
      largv2.should.deep.equal(result);
    });

    it('should alias h/help and v/verbose', () => {
      const cli = new Cli();
      const largv1 = cli.largv(['--', '-h', '-v']);
      largv1.help.should.equal(true);
      largv1.verbose.should.equal(1);
      const largv2 = cli.largv(['--', '--help', '--verbose']);
      largv2.h.should.equal(true);
      largv2.v.should.equal(1);
    });

    it('should count -v options', () => {
      const cli = new Cli();
      const largv = cli.largv(['--', '-vvv']);
      largv.v.should.equal(3);
      largv.verbose.should.equal(3);
    });
  });

  describe('#makeArt', () => {
    it('should be the same as art()', () => {
      const cli = new Cli();
      const opts = {paddingTop: 4, paddingBottom: 100};
      cli.makeArt('update', opts).should.deep.equal(art('update', opts));
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
      const task = cli.parseToYargs({command: 'task', describe: 'desc'});
      task.command.should.be.a('string');
      task.describe.should.be.a('string');
      task.builder.should.be.an('object');
      task.handler.should.be.a('function');
    });

    it('should emit task-TASK-answers event before interactive prompt with argv and interactive options', () => {
      const cli = new Cli();
      const events = new AsyncEvents();
      const task = cli.parseToYargs(fakeTask, events);
      events.on('task-task-answers', data => {
        data.argv.should.be.an('object');
        data.argv.should.have.property('_');
        data.inquirer.should.be.an('array');
        // Set this to true so we dont get held up on the interactive options
        data.argv.yes = true;
        data.argv.other = 'something';
      });
      task.handler({_: ['task']}).should.be.fullfilled;
    });

    it('should emit task-TASK-run event after interactive prompt and before run with finalized options', () => {
      const cli = new Cli();
      const events = new AsyncEvents();
      const task = cli.parseToYargs(fakeTask, events);
      events.on('task-task-run', data => {
        data.should.be.an('object');
      });
      task.handler({_: ['task'], yes: true, other: 'something'}).should.be.fullfilled;
    });

    it('should translate interactive options into an array inquirer can use', () => {
      const cli = new Cli();
      const events = new AsyncEvents();
      const task = cli.parseToYargs(fakeTask, events);
      events.on('task-task-answers', data => {
        data.inquirer.should.be.an('array');
        data.inquirer.should.have.length(2);
        data.inquirer[0].should.have.property('weight', 0);
        data.inquirer[0].should.have.property('name', 'yes');
        data.inquirer[1].should.have.property('weight', 4);
        data.inquirer[1].should.have.property('name', 'other');
        // Set this to true so we dont get held up on the interactive options
        data.argv.yes = true;
        data.argv.other = 'something';
      });
      task.handler({_: ['task']}).should.be.fullfilled;
    });

    it('should strip out any interactive questions that are already answered', () => {
      const cli = new Cli();
      const events = new AsyncEvents();
      const task = cli.parseToYargs(fakeTask, events);
      task.handler({_: ['task'], yes: true, other: 'something'}).should.be.fullfilled;
    });
  });
});
