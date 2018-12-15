'use strict';

// Modules
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Constants
const epilog = [
  chalk.green('Global Options:\n'),
  '  --clear  Clear the task cache\n',
  '  --help, -h  Show help\n',
  '  --verbose, -v, -vv, -vvv, -vvvv  Change verbosity of output',
];

// Helper to filter out interactive options that have been answered already
const filterInteractive = (inquiry, argv) => _.filter(inquiry, option => {
  return _.isNil(argv[option.name]) || argv[option.name] === false;
});

// Helper to check for updates
const checkForUpdates = lando => {
  // Check for updates
  return lando.Promise.try(() => {
    if (lando.updates.fetch(lando.cache.get('updates'))) {
      lando.log.verbose('Checking for updates...');
      return lando.updates.refresh(lando.config.version)
      .then(latest => lando.cache.set('updates', latest, {persist: true}));
    }
  })

  // Update warning
  .then(() => {
    if (lando.updates.updateAvailable(lando.config.version, lando.cache.get('updates').version)) {
      console.log(lando.cli.makeArt('update', {paddingBottom: 0}));
      console.log(chalk.green(lando.cache.get('updates').url));
      console.log(' ');
    }
  });
};

// Helper to prompt the user if needed
const handleInteractive = (argv, inquiry) => {
  const questions = _.sortBy(filterInteractive(inquiry, argv), 'weight');
  if (!_.isEmpty(questions)) {
    const inquirer = require('inquirer');
    return inquirer.prompt(questions);
  } else {
    return {};
  }
};

/*
 * Construct the CLI
 */
module.exports = class Cli {
  constructor(prefix = 'LANDO', logLevel = 'warn', userConfRoot = path.join(os.homedir(), '.lando')) {
    this.prefix = prefix;
    this.logLevel = logLevel;
    this.userConfRoot = userConfRoot;
    this.handleError = (error, handler, verbose = this.largv().verbose) => {
      error.verbose = verbose;
      return process.exit(handler.handle(error));
    };
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
    const sudoBlock = require('sudo-block');
    sudoBlock(chalk.red('Lando should never be run as root! ... like ever'));
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
    const parse = require('yargs-parser');
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
      domain: 'lndo.site',
      envPrefix: this.prefix,
      landoFile: '.lando.yml',
      logLevelConsole: (this.largv().verbose) ? this.largv().verbose + 1 : this.logLevel,
      logDir: path.join(this.userConfRoot, 'logs'),
      mode: 'cli',
      pluginDirs: [srcRoot, this.userConfRoot],
      product: 'lando',
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
    const Table = require('./table');
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
  parseToYargs({command, describe, options = {}, run = {}, level = 'app'}) {
    // Add name to any options that dont have it already
    _.forEach(options, (option, name) => {
      if (!_.has(option, 'name')) option.name = name;
    });
    // Translate options to inquiry
    const inquiry = _.map(_.filter(options, option => !_.isEmpty(option.interactive)), option => {
      return _.merge({}, {name: option.name, weight: 0}, option.interactive);
    });

    // Build a handler that incorporates interactive options and bootstraps lando
    const handler = argv => {
      const Lando = require('./../lib/lando');
      const lando = new Lando(this.defaultConfig());

      // Handle uncaught things
      _.forEach(['unhandledRejection', 'uncaughtException'], exception => {
        process.on(exception, error => this.handleError(error, lando.error));
      });

      // Check for updates and get things started
      return checkForUpdates(lando).then(() => lando.bootstrap(level).then(lando => {
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
        return lando.events.emit(`cli-${command}-answers`, {argv: argv, inquirer: inquiry})

        // Attempt to filter out questions that have already been answered
        // Prompt the use for feedback if needed and sort by weight
        .then(() => handleInteractive(argv, inquiry))

        /**
         * Event that allows final altering of answers before the task runs
         *
         * You will want to replace CMD with the actual task name eg `task-start-run`.
         *
         * @since 3.0.0
         * @event task_CMD_run
         * @property {Object} answers object
         */
        // @TODO: somehow handle when commands break eg change task name, malformed tasks
        .then(answers => lando.events.emit(`cli-${command}-run`, _.merge(argv, answers)))

        // Find and run the task, unless we already have one
        .then(() => (_.isFunction(run)) ? run(argv, lando) : _.find(lando.tasks, {command}).run(argv))

        // Handle all other errors eg likely things that happen pre bootstrap
        .catch(error => this.handleError(error, lando.error, 2));
      }));
    };

    // Return our yarg command
    return {command, describe, builder: options, handler};
  };

  /*
   * Run the CLI
   */
  run(tasks = []) {
    const yargonaut = require('yargonaut');
    yargonaut.style('green').errorsStyle('red');
    const yargs = require('yargs');

    // Start up the CLI
    const cmd = !_.has(process, 'pkg') ? '$0' : path.basename(_.get(process, 'execPath', 'lando'));
    yargs.usage(`Usage: ${cmd} <command> [args] [options] [-- global options]`);

    // Loop through the tasks and add them to the CLI
    _.forEach(_.sortBy(tasks, 'command'), task => {
      if (_.has(task, 'handler')) yargs.command(task);
      else yargs.command(this.parseToYargs(task));
    });

    // Invoke help if global option is specified
    if (this.largv().help) {
      yargs.showHelp();
      process.exit(0);
    }

    // Clear the
    if (this.largv().clear) {
      fs.unlinkSync(process.landoTaskCacheFile);
      process.exit(0);
    }

    // Finish up the yargs
    yargs
      .strict(true)
      .demandCommand(1, 'You need at least one command before moving on')
      .epilog(epilog.join(''))
      .wrap(yargs.terminalWidth() * 0.75)
      .argv;
  };
};
