'use strict';

// Modules
const chalk = require('yargonaut').chalk();
const os = require('os');

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
exports.initHeader = (lines = []) => {
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
exports.startHeader = (lines = []) => {
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
exports.tunnelHeader = (lines = []) => {
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
exports.updateMessage = (url, lines =[]) => {
  lines.push('');
  lines.push(chalk.yellow('There is an update available!!!'));
  lines.push(chalk.yellow('Install it to get the latest and greatest'));
  lines.push('');
  lines.push('Updating helps us provide the best support.');
  lines.push(chalk.green(url));
  lines.push('');
  return lines.join(os.EOL);
};
