'use strict';

// Modules
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');

/*
 * Helper to sort options
 */
const sortOptions = options => _(options)
  .keys()
  .sortBy()
  .map(key => [key, options[key]])
  .fromPairs()
  .value();

/*
 * Helper to get interactive options
 */
const getInteractive = (options, argv) => _(options)
  .map((option, name) => _.merge({}, {name}, {option}))
  .filter(option => !_.isEmpty(_.get(option, 'option.interactive', {})))
  .map(option => _.merge({}, {name: option.name, weight: 0}, option.option.interactive))
  .map(option => {
    if (_.isNil(argv[option.name]) || argv[option.name] === false) return option;
    else {
      return _.merge({}, option, {when: answers => {
        answers[option.name] = argv[option.name];
        return false;
      }});
    }
  })
  .value();

/*
 * Helper to check for updates
 */
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

/*
 * Helper to prompt the user if needed
 */
const handleInteractive = (inquiry, argv, command, lando) => lando.Promise.try(() => {
  if (_.isEmpty(inquiry)) return {};
  else {
    const inquirer = require('inquirer');
    // Try to rebuild the inquiry if this is app level bootstrap and we have an app
    if (!_.isEmpty(argv._app) && lando._bootstrap === 'app') {
      const app = lando.getApp(argv._app.configFile);
      return app.init().then(() => {
        inquiry = getInteractive(_.find(app.tasks.concat(lando.tasks), {command: command}).options, argv);
        return inquirer.prompt(_.sortBy(inquiry, 'weight'));
      });
    // Otherwise just run
    } else {
      inquiry = getInteractive(_.find(lando.tasks, {command: command}).options, argv);
      return inquirer.prompt(_.sortBy(inquiry, 'weight'));
    }
  }
});

/*
 * Construct the CLI
 */
module.exports = class Cli {
  constructor(prefix = 'LANDO', logLevel = 'warn', userConfRoot = path.join(os.homedir(), '.lando')) {
    this.prefix = prefix;
    this.logLevel = logLevel;
    this.userConfRoot = userConfRoot;
    this.handleError = (error, handler, verbose = this.argv().verbose) => {
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
      logLevelConsole: (this.argv().verbose) ? this.argv().verbose + 1 : this.logLevel,
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
    const handler = argv => {
      // Immediately build some arg data set opts and interactive options
      const data = {options: argv, inquiry: getInteractive(options, argv)};
      // Summon lando
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
        return lando.events.emit('cli-answers', data, argv._[0])
        .then(() => lando.events.emit(`cli-${argv._[0]}-answers`, data, argv._[0]))

        // Attempt to filter out questions that have already been answered
        // Prompt the use for feedback if needed and sort by weight
        .then(() => handleInteractive(data.inquiry, data.options, command, lando))

        /**
         * Event that allows final altering of answers before the task runs
         *
         * You will want to replace CMD with the actual task name eg `task-start-run`.
         *
         * @since 3.0.0
         * @event task_CMD_run
         * @property {Object} answers object
         */
        .then(answers => lando.events.emit('cli-run', _.merge(data.options, answers), argv._[0]))
        .then(() => lando.events.emit(`cli-${argv._[0]}-run`, data, argv._[0]))

        // Find and run the task, unless we already have one
        // @TODO: somehow handle when commands break eg change task name, malformed tasks
        .then(() => {
          if (_.isFunction(run)) return run(data.options, lando);
          else return _.find(lando.tasks, {command}).run(data.options);
        })

        // Handle all other errors eg likely things that happen pre bootstrap
        .catch(error => this.handleError(error, lando.error, 2));
      }));
    };

    // Return our yarg command
    return {command, describe, builder: sortOptions(options), handler};
  };

  /*
   * Run the CLI
   */
  run(tasks = [], config = {}) {
    const yargonaut = require('yargonaut');
    yargonaut.style('green').errorsStyle('red');
    const yargs = require('yargs');

    // Clear any task caches we have
    if (yargs.argv.clear) {
      if (fs.existsSync(process.landoTaskCacheFile)) fs.unlinkSync(process.landoTaskCacheFile);
      if (fs.existsSync(process.landoAppTaskCacheFile)) fs.unlinkSync(process.landoAppTaskCacheFile);
    }

    // Start up the CLI
    const cmd = !_.has(process, 'pkg') ? '$0' : path.basename(_.get(process, 'execPath', 'lando'));
    yargs.usage(`Usage: ${cmd} <command> [args] [options]`)
      .demandCommand(1, 'You need at least one command before moving on')
      .example('lando start', 'Run lando start')
      .example('lando rebuild --lando', 'Get help about using the lando rebuild command')
      .example('lando destroy -y -vvv', 'Run lando destroy non-interactively and with maximum verbosity')
      .example('lando --clear', 'Clear the lando tasks cache')
      .middleware([(argv => {
        argv._app = config;
      })])
      .recommendCommands()
      .wrap(yargs.terminalWidth() * 0.70)
      .option('clear', {describe: 'Clears the lando tasks cache', global: true, type: 'boolean'})
      .help('lando', 'Show help for lando-based options')
      .option('verbose', {alias: 'v', describe: 'Runs with extra verbosity', type: 'count'})
      .version();

    // Loop through the tasks and add them to the CLI
    _.forEach(_.sortBy(tasks, 'command'), task => {
      if (_.has(task, 'handler')) yargs.command(task);
      else yargs.command(this.parseToYargs(task));
    });

    // YARGZ MATEY
    yargs.argv;
  };
};
