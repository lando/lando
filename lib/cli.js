'use strict';

// Modules
const _ = require('lodash');
const chalk = require('chalk');
const AsyncEvents = require('./events');
const inquirer = require('inquirer');
const os = require('os');
const path = require('path');
const parse = require('yargs-parser');
const sudoBlock = require('sudo-block');
const Table = require('./table');

// Helper to filter out interactive options that have been answered already
const filterInteractive = (inquiry, argv) => _.filter(inquiry, option => {
  return _.isNil(argv[option.name]) || argv[option.name] === false;
});

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
    const globals = _.filter(parse(args)._, value => _.startsWith(value, '-'));
    return parse(globals, {alias: {'verbose': ['v'], 'help': ['h']}, count: ['v']});
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
    const srcRoot = path.resolve(__dirname, '..');
    return {
      configSources: [path.join(srcRoot, 'config.yml'), path.join(this.userConfRoot, 'config.yml')],
      envPrefix: this.prefix,
      logLevelConsole: (this.largv().verbose) ? this.largv().verbose + 1 : this.logLevel,
      logDir: path.join(this.userConfRoot, 'logs'),
      mode: 'cli',
      pluginDirs: [srcRoot, this.userConfRoot],
      userConfRoot: this.userConfRoot,
      version: require(path.join(__dirname, '..', 'package.json')).version,
    };
  };

  /**
   * Returns some cli art
   *
   * This means all the options passed in before the `--` flag.
   *
   * @since 3.0.0
   * @alias lando.cli.makeArt
   * @param {String} header parsed options
   * @param {Object} opts parsed options
   * @return {Object} Yarg parsed options
   * @example
   * // Gets all the pre-global options that have been specified.
   * const argv = lando.tasks.argv();
   * @todo make this static and then fix all call sites
   */
  makeArt(header, opts) {
    return require('./art')(header, opts);
  };

  /**
   * Utility function to help construct CLI displayable tables
   *
   * @since 3.0.0
   * @alias lando.cli.makeTable
   * @param {Object} [opts] Options for how the table should be built
   * @param {String} [opts.arrayJoiner=', '] A delimiter to be used when joining array data
   * @return {Object} Table metadata that can be printed with toString()
   * @example
   * // Grab a new cli table
   * const table = new lando.cli.makeTable();
   *
   * // Add data
   * table.add('NAME', app.name);
   * table.add('LOCATION', app.root);
   * table.add('SERVICES', _.keys(app.services));
   * table.add('URLS', urls, {arrayJoiner: '\n'});
   *
   * // Print the table
   * console.log(table.toString());
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
   * @param {Object} [events=new AsyncEvents()] An AsyncEvents
   * @return {Object} A yargs command object
   * @example
   * // Add a task to the yargs CLI
   * yargs.command(lando.tasks.parseToYargs(task));
   */
  parseToYargs({command, describe, run, options = {}}, events = new AsyncEvents()) {
    // Add name to any options that dont have it already
    _.forEach(options, (option, name) => {
      // @todo we shouldn't have to check the type here, fix that
      if (typeof option === 'object' && !_.has(option, 'name')) {
        option.name = name;
      }
    });
    // Translate options to inquiry
    const inquiry = _.map(_.filter(options, option => !_.isEmpty(option.interactive)), option => {
      return _.merge({}, {name: option.name, weight: 0}, option.interactive);
    });

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

      // Attempt to filter out questions that have already been answered
      // Prompt the use for feedback if needed and sort by weight
      .then(() => inquirer.prompt(_.sortBy(filterInteractive(inquiry, argv), 'weight')))

      // Merge data from our interfaces and provide to the task runner
      .then(answers => {
        /**
         * Event that allows final altering of answers.
         *
         * You will want to replace CMD with the actual task name eg `task-start-run`.
         *
         * @since 3.0.0
         * @event task_CMD_run
         * @property {Object} answers object
         */
        return events.emit(['task', argv._[0], 'run'].join('-'), _.merge(argv, answers))

        // Run the task
        .then(() => run(argv));
      });
    };

    // Return the completed object
    return {command, describe, builder: options, handler};
  };
};
