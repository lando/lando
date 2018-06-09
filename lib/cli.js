'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const inquirer = require('inquirer');
const os = require('os');
const parse = require('yargs-parser');
const Table = require('./table');

module.exports = class Cli {
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
  }

  /**
   * A factory function to generate a new Cli Table
   *
   * @param {object} opts options
   * @return {Table}
   */
  makeTable(opts = {}) {
    return new Table(opts);
  }

  /*
   * Helper function to parse global opts
   */
  parseGlobals(args = []) {
    // Get our raw

    const rawArgs = args || process.argv.slice(2);
    // @todo: let?
    let globz = parse(rawArgs);

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
  /**
   * Returns a cheeky header that can be used after an app is init.
   *
   * @since 3.0.0
   * @alias lando.cli.initHeader
   * @param {Array} [lines=[]] url The URL with the link to the update
   * @return {String} A header string we can print to the CLI
   * @example
   * // Print the header to the console
   * console.log(lando.cli.initHeader());
   */
  initHeader(lines = []) {
    lines.push('');
    lines.push(chalk.green('NOW WE\'RE COOKING WITH FIRE!!!'));
    lines.push('Your app has been initialized!');
    lines.push('');
    lines.push('Go to the directory where your app was initialized and run');
    lines.push('`lando start` to get rolling.');
    lines.push('');
    lines.push('Check the LOCATION printed below if you are unsure where to go.');
    lines.push('');
    lines.push('Here are some vitals:');
    lines.push('');
    return lines.join(os.EOL);
  };

  /**
   * Returns a cheeky header that can be used after an app is started.
   *
   * @since 3.0.0
   * @alias lando.cli.startHeader
   * @param {Array} [lines=[]] url The URL with the link to the update
   * @return {String} A header string we can print to the CLI
   * @example
   * // Print the header to the console
   * console.log(lando.cli.startHeader());
   */
  startHeader(lines = []) {
    lines.push('');
    lines.push(chalk.green('BOOMSHAKALAKA!!!'));
    lines.push('');
    lines.push('Your app has started up correctly.');
    lines.push('Here are some vitals:');
    lines.push('');
    return lines.join(os.EOL);
  };

  /**
   * Returns a cheeky header that can be used after an app is shared
   *
   * @since 3.0.0
   * @alias lando.cli.tunnelHeader
   * @param {Array} [lines=[]] url The URL with the link to the update
   * @return {String} A header string we can print to the CLI
   * @example
   * // Print the header to the console
   * console.log(lando.cli.tunnelHeader());
   */
  tunnelHeader(lines = []) {
    lines.push('');
    lines.push(chalk.green('YOU ARE NOW SHARED WITH THE WORLD!!!'));
    lines.push('');
    lines.push('A local tunnel to your app has been established.');
    lines.push('');
    lines.push('Here is your public url:');
    return lines.join(os.EOL);
  };

  /**
   * Returns a mesage indicating the availability of an update
   *
   * @since 3.0.0
   * @alias lando.cli.updateMessage
   * @param {String} url The URL with the link to the update
   * @param {Array} [lines=[]] url The URL with the link to the update
   * @return {String} An update message we can print to the CLI
   * @example
   * // Print the header to the console
   * console.log(lando.cli.updateMessage());
   */
  updateMessage(url, lines =[]) {
    lines.push('');
    lines.push(chalk.yellow('There is an update available!!!'));
    lines.push(chalk.yellow('Install it to get the latest and greatest'));
    lines.push('');
    lines.push('Updating helps us provide the best support.');
    lines.push(chalk.green(url));
    lines.push('');
    return lines.join(os.EOL);
  };
};

