'use strict';

// Modules
const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const os = require('os');
const path = require('path');
const parse = require('yargs-parser');
const sudoBlock = require('sudo-block');
const Table = require('./table');

/*
 * Construct the CLI
 */
module.exports = class Cli {
  constructor(prefix = 'LANDO', logLevel = 'warn', userConfRoot = path.join(os.homedir(), '.lando')) {
    this.prefix = prefix;
    this.logLevel = logLevel;
    this.userConfRoot = userConfRoot;
  };

  /**
   * Returns some cli art
   *
   * This means all the options passed in before the `--` flag.
   *
   * @since 3.0.0
   * @alias lando.cli.argv
   * @return {Object} Yarg parsed options
   * @example
   * // Gets all the pre-global options that have been specified.
   * const argv = lando.tasks.argv();
   * @todo make this static and then fix all call sites
   */
  art() {
    return require('./art');
  };

  /**
   * Returns the lando options
   *
   * This means all the options passed in before the `--` flag.
   *
   * @since 3.0.0
   * @alias lando.cli.argv
   * @return {Object} Yarg parsed options
   * @example
   * // Gets all the pre-global options that have been specified.
   * const argv = lando.tasks.argv();
   * @todo make this static and then fix all call sites
   */
  argv() {
    return require('yargs').argv;
  };

  /**
   * Returns the lando options
   *
   * This means all the options passed in before the `--` flag.
   *
   * @since 3.0.0
   * @alias lando.cli.checkPerms
   * @example
   * // Gets all the pre-global options that have been specified.
   * const argv = lando.tasks.argv();
   * @todo make this static and then fix all call sites
   */
  checkPerms() {
    sudoBlock(chalk.red('Lando should never be run as root!'));
  };

  /**
   * A singleton object that contains the Lando global options.
   *
   * This means all the options passed in after the `--` flag.
   *
   * @since 3.0.0
   * @param {Object} [args=process.argv.slive(2)] Options
   * @return {Object} Just the global options
   * @alias lando.cli.largv
   * @example
   *
   * // Gets all the global options that have been specified.
   * var largv = lando.tasks.largv;
   */
  largv(args = process.argv.slice(2)) {
    // @todo: let?
    let globz = parse(args);

    // The first parsing
    // Check if we have _. and then filter by -
    if (!_.isEmpty(globz._)) {
      globz = _.filter(globz._, value => _.startsWith(value, '-'));
    } else {
      globz = [];
    }

    // Return the globalz
    return parse(globz, {
      alias: {'verbose': ['v'], 'help': ['h']},
      count: ['v'],
    });
  };

  /**
   * Returns the lando options
   *
   * This means all the options passed in before the `--` flag.
   *
   * @since 3.0.0
   * @alias lando.cli.defaultConfig
   * @return {Object} default cli bootstrap options
   * @example
   * // Gets all the pre-global options that have been specified.
   * const argv = lando.tasks.argv();
   * @todo make this static and then fix all call sites
   */
  defaultConfig() {
    // Define the bootstrap up options
    return {
      configSources: [path.join(this.userConfRoot, 'config.yml')],
      envPrefix: this.prefix,
      logLevelConsole: (this.largv().verbose) ? this.largv().verbose + 1 : this.logLevel,
      logDir: path.join(this.userConfRoot, 'logs'),
      mode: 'cli',
      pluginDirs: [this.userConfRoot],
      userConfRoot: this.userConfRoot,
      version: require(path.join(__dirname, '..', 'package.json')).version,
    };
  };

  /**
   * A factory function to generate a new Cli Table
   *
   * @since 3.0.0
   * @alias lando.cli.makeTable
   * @param {object} opts options
   * @return {Table}
   */
  makeTable(opts = {}) {
    return new Table(opts);
  };

  /**
   * Parses a lando task object into something that can be used by the [yargs](http://yargs.js.org/docs/) CLI.
   *
   * A lando task object is an abstraction on top of yargs that also contains some
   * metadata about how to interactively ask questions on both a CLI and GUI.
   *
   * The interactivity metadata is a superset of [inquirer](https://github.com/sboudrias/Inquirer.js) data.
   *
   * @todo Injecting the events here seems not the way we want to go?
   *
   * @since 3.0.0
   * @alias lando.cli.parseToYargs
   * @see [yargs docs](http://yargs.js.org/docs/)
   * @see [inquirer docs](https://github.com/sboudrias/Inquirer.js)
   * @param {Object} task A Lando task object (@see add for definition)
   * @param {Object} events The Lando events engine
   * @return {Object} A yargs command object
   * @example
   * // Add a task to the yargs CLI
   * yargs.command(lando.tasks.parseToYargs(task));
   */
  parseToYargs({options = [], command, describe, run} = {}, events) {
    // Translate options to inquiry
    // @todo: get some defaults in here
    const inquiry = _.compact(_.map(options, (option, name) => {
      if (option && option.interactive) {
        const question = option.interactive;
        question.name = question.name || name;
        question.weight = question.weight || 0;
        return question;
      }
    }));

    // Build a handler that incorporates interactive options
    const handler = argv => {
      /**
       * Event that allows altering of argv or inquirer before interactive prompts
       * are run
       *
       * task-CMD-answers
       *
       * @since 3.0.0
       * @event task_CMD_answers
       * @property {Object} answers argv and inquirer questions
       */
      return events.emit(['task', argv._[0], 'answers'].join('-'), {argv: argv, inquirer: inquiry})

      // Do the filtering
      .then(() => {
        // Attempt to filter out questions that have already been answered
        const questions = _.filter(inquiry, option => (_.isNil(argv[option.name]) || argv[option.name] === false));
        // Prompt the use for feedback if needed and sort by weight
        return inquirer.prompt(_.sortBy(questions, 'weight'));
      })

      // Merge data from our interfaces and provide to the task runner
      .then(answers => {
        // Merge it all together
        const truth = _.merge(argv, answers);

        /**
         * Event that allows final altering of answers.
         *
         * You will want to replace CMD with the actual task name eg `task-start-run`.
         *
         * @since 3.0.0
         * @event task_CMD_run
         * @property {Object} answers object
         */
        return events.emit(['task', argv._[0], 'run'].join('-'), truth)

        // Run the task
        .then(() => run(truth));
      });
    };

    // Return the completed object
    return {
      command,
      describe,
      builder: options,
      handler,
    };
  };
};
