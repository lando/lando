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
   * Returns a parsed array of CLI arguments and options
   *
   * @since 3.0.0
   * @alias lando.cli.argv
   * @return {Object} Yarg parsed options
   * @example
   * const argv = lando.cli.argv();
   * @todo make this static and then fix all call sites
   */
  argv() {
    return require('yargs').argv;
  };

  /**
   * Checks to see if lando is running with sudo. If it is it
   * will exit the process with a stern warning
   *
   * @since 3.0.0
   * @alias lando.cli.checkPerms
   * @example
   * lando.cli.checkPerms()
   */
  checkPerms() {
    sudoBlock(chalk.red('Lando should never be run as root!'));
  };

  /**
   * Returns a parsed object of all global options.
   *
   * This means all the options passed in after the `--` flag.
   *
   * @since 3.0.0
   * @param {Object} [args=process.argv.slice(2)] Options
   * @return {Object} Yarg parsed options
   * @alias lando.cli.largv
   * @example
   * const largv = lando.cli.largv();
   */
  largv(args = process.argv.slice(2)) {
    const globals = _.filter(parse(args)._, value => _.startsWith(value, '-'));
    return parse(globals, {alias: {'verbose': ['v'], 'help': ['h']}, count: ['v']});
  };

  /**
   * Returns a config object with some good default settings for bootstrapping
   * lando as a command line interface
   *
   * @since 3.0.0
   * @alias lando.cli.defaultConfig
   * @return {Object} Config that can be used in a Lando CLI bootstrap
   * @example
   * const config = lando.cli.defaultConfig();
   * // Kick off our bootstrap
   * bootstrap(config).then(lando => console.log(lando));
   */
  defaultConfig() {
    const srcRoot = path.resolve(__dirname, '..');
    const version = require(path.join(__dirname, '..', 'package.json')).version;
    return {
      configSources: [path.join(srcRoot, 'config.yml'), path.join(this.userConfRoot, 'config.yml')],
      envPrefix: this.prefix,
      logLevelConsole: (this.largv().verbose) ? this.largv().verbose + 1 : this.logLevel,
      logDir: path.join(this.userConfRoot, 'logs'),
      mode: 'cli',
      pluginDirs: [srcRoot, this.userConfRoot],
      userConfRoot: this.userConfRoot,
      userAgent: 'Lando/' + version,
      version,
    };
  };

  /**
   * Returns some cli "art"
   *
   * @since 3.0.0
   * @alias lando.cli.makeArt
   * @param {String} [header='start'] The type of header you want to get
   * @param {Object} [opts] Padding options
   * @param {Object} [opts.paddingTop=1] Lines to pad on top of the art
   * @param {Object} [opts.paddingBottom=1] Lines to pad below the art
   * @return {Object} Yarg parsed options
   * @example
   * console.log(lando.cli.makeArt('init', {paddingTop: 100});
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
      if (!_.has(option, 'name')) option.name = name;
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
       * You will want to replace CMD with the actual task name eg `task-start-answers`.
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
         * Event that allows final altering of answers before the task runs
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
