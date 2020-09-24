'use strict';

// Modules
const _ = require('lodash');
const niceFont = require('yargonaut').asFont;
const chalk = require('yargonaut').chalk();
const os = require('os');

/*
 * Helper to stylize code or a command
 */
const codeMe = text => chalk.italic(text);

/*
 * Helper to stylize an italicize
 */
const italicize = name => chalk.italic(name);

/*
 * Helper to stylize a warning message
 */
const warningMessage = ({title, detail = [], command = '', url = ''} = {}) => `
 ${chalk.yellow(`■ ${title}`)}
   ${detail.join(`${os.EOL}   `)}
   ${(url) ? chalk.green(url) : codeMe(command)}
`;

/*
 * Helper to show that an app has started
 */
exports.appDestroy = ({name, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'abort':
      return chalk.yellow('DESTRUCTION AVERTED!');
    case 'pre':
      return chalk.cyan(`Preparing to consign ${italicize(name)} to the dustbin of history...`);
    case 'post':
      return [
        chalk.red(`The app known as ${italicize(name)} has paid the ${chalk.bold('IRON PRICE')}. App destroyed!`),
      ].join(os.EOL);
  }
};

/*
 * Helper to show that an app has restarted
 */
exports.appRebuild = ({name, phase = 'pre', warnings = {}} = {}) => {
  switch (phase) {
    case 'abort':
      return chalk.yellow('REBUILD ABORTED!');
    case 'error':
      return exports.appStart({name, phase: 'error', warnings});
    case 'pre':
      return chalk.cyan('Rising anew like a fire phoenix from the ashes! Rebuilding app...');
    case 'post':
      return exports.appStart({name, phase: 'post'});
    case 'report':
      return exports.appStart({name, phase: 'report', warnings});
  }
};

/*
 * Helper to show that an app has restarted
 */
exports.appRestart = ({name, phase = 'pre', warnings = {}} = {}) => {
  switch (phase) {
    case 'error':
      return exports.appStart({name, phase: 'error', warnings});
    case 'pre':
      return chalk.cyan('Stopping and restarting your app...Shiny!');
    case 'post':
      return exports.appStart({name, phase: 'post'});
    case 'report':
      return exports.appStart({name, phase: 'report', warnings});
  }
};

/*
 * Helper to show that an app has started
 */
exports.appStart = ({name, phase = 'pre', warnings = {}} = {}) => {
  switch (phase) {
    case 'error':
      return [
        '',
        chalk.red(niceFont('Uh oh!', 'ANSI Shadow')),
        '',
        'An error occurred while starting up your app!',
        'Here are a few things you can try to get back into a good state:',
        '',
        chalk.yellow(`  ■ Try running ${codeMe('lando rebuild')}`),
        chalk.yellow(`  ■ Try restarting in debug mode ${codeMe('lando restart -vvv')}`),
        chalk.yellow(`  ■ Try checking the logs with ${codeMe('lando logs')}`),
        '',
        'If those fail then consult the troubleshooting materials:',
        '',
        chalk.magenta('  ■ https://docs.lando.dev/help/logs.html'),
        chalk.magenta('  ■ https://docs.lando.dev/help/updating.html'),
        '',
        'Or post your issue to Slack or GitHub',
        '',
        chalk.green('  ■ Slack - https://launchpass.com/devwithlando'),
        chalk.green('  ■ GitHub - https://github.com/lando/lando/issues/new/choose'),
        '',
      ].join(os.EOL);
    case 'pre':
      return chalk.cyan(`Let\'s get this party started! Starting app ${italicize(name)}...`);
    case 'post':
      return [
        '',
        chalk.magenta(niceFont('Boomshakalaka!!!', 'Small Slant')),
        '',
        'Your app has started up correctly.',
        'Here are some vitals:',
        '',
      ].join(os.EOL);
    case 'report':
      const message = [
        '',
        chalk.yellow(niceFont('Warning!', 'Small Slant')),
        '',
        'Your app started up but we detected some things you may wish to investigate.',
        `These only ${italicize('may')} be a problem.`,
        '',
      ];

      // Add in all our warnings
      _.forEach(warnings, warning => {
        message.push(warningMessage(warning));
      });

      message.push('');
      message.push('Here are some vitals:');
      message.push('');
      return message.join(os.EOL);
  }
};

/*
 * Helper to show that an app has stopped
 */
exports.appStop = ({name, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return chalk.cyan(`This party\'s over :( Stopping app ${italicize(name)}`);
    case 'post':
      return chalk.red(`App ${italicize(name)} has been stopped!`);
  }
};

/*
 * Helper to show that a first error has occurred
 */
exports.crash = () => [
  '',
  chalk.red(niceFont('CRASH!!!', 'ANSI Shadow')),
  '',
  'Would you like to report it, and subsequent crashes, to Lando?',
  '',
  'This data is only used by the Lando team to ensure the application runs as well as it can.',
  chalk.green('For more details check out https://docs.lando.dev/privacy/'),
].join(os.EOL);

/*
 * Helper to show status of experimental toggle
 */
exports.experimental = (on = false) => {
  switch (on) {
    case true:
      return [
        '',
        chalk.green(niceFont('Activated!!!', 'Small Slant')),
        chalk.magenta('Experimental features are now ON'),
        '',
      ].join(os.EOL);
    case false:
      return [
        '',
        chalk.red(niceFont('Deactivated!', 'Small Slant')),
        chalk.grey('Experimental features are now OFF'),
        '',
      ].join(os.EOL);
  }
};

/*
 * Helper to show init header
 */
exports.init = () => [
  '',
  chalk.green(niceFont('Now we\'re', 'Small Slant')),
  chalk.magenta(niceFont('COOKING WITH FIRE!', 'Small Slant')),
  'Your app has been initialized!',
  '',
  `Go to the directory where your app was initialized and run ${codeMe('lando start')} to get rolling.`,
  'Check the LOCATION printed below if you are unsure where to go.',
  '',
  'Oh... and here are some vitals:',
  '',
].join(os.EOL);

/*
 * Helper to show new content
 */
exports.newContent = (type = 'guide') => [
  '',
  chalk.green(niceFont(`New ${type} has been...`, 'Small Slant')),
  chalk.magenta(niceFont('Created!', 'Small Slant')),
  '',
  `Make sure you have run ${codeMe('lando start')} to get the docs running locally.`,
  '',
  'Oh... and here are some vitals about your new content:',
  '',
].join(os.EOL);

/*
 * Helper to show NO DOCKER error message
 */
exports.noDockerDep = (dep = 'Docker') => [
  '',
  chalk.red(niceFont('Uh oh!', 'ANSI Shadow')),
  '',
  `Lando could not detect an installation of ${dep}, which is a required dependency!`,
  'This most often happens if you have installed from source and have not RTFM.',
  '',
  'We recommend you check out the Install From Source docs and make sure you have',
  'manually installed all the needed dependencies first.',
  chalk.green('https://docs.lando.dev/basics/installation.html#from-source'),
  '',
  'When you have completed the above, try running Lando again. If you still have issues',
  'we recommend you install Lando from the latest package installer as this will install',
  'and setup the needed dependencies for you.',
  chalk.green('https://github.com/lando/lando/releases'),
  '',
  'If you are still having issues after that we recommend you post an issue on Github',
  'or ping us in the Slack channel',
  '',
  chalk.magenta('  ■ Slack - https://launchpass.com/devwithlando'),
  chalk.magenta('  ■ GitHub - https://github.com/lando/lando/issues/new/choose'),
  '',
].join(os.EOL);

/*
 * Helper to show status of secret toggle
 */
exports.poweroff = ({phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return [
        '',
        chalk.cyan('NO!! SHUT IT ALL DOWN!!!'),
        chalk.magenta(niceFont('Powering off...', 'Small Slant')),
        '',
      ].join(os.EOL);
    case 'post':
      return chalk.green('Lando containers have been spun down.');
  }
};

/*
 * Helper to show status of secret toggle
 */
exports.print = ({text, color = 'white'} = {}) => {
  return chalk[color](text);
};

/*
 * Helper to show status of secret toggle
 */
exports.printFont = ({text, color = 'magenta', font = 'Small Slant'} = {}) => {
  return chalk[color](niceFont(text, 'Small Slant'));
};

/*
 * Helper to show status of release channel
 */
exports.releaseChannel = (channel = 'stable') => {
  switch (channel) {
    case 'edge':
      return [
        '',
        chalk.green('You are now living on the'),
        chalk.magenta(niceFont('EDGE', 'Small Slant')),
        'Lando will update you about ALL new releases!',
        '',
      ].join(os.EOL);
    case 'none':
      return [
        '',
        chalk.green('You will no longer receive update notifications.'),
        chalk.yellow(niceFont('WARNING', 'Small Slant')),
        'If you do not continue to update manually this may limit our ability to support you!',
        '',
      ].join(os.EOL);
    case 'stable':
      return [
        '',
        chalk.green('Slowing things down to get more'),
        chalk.magenta(niceFont('STABLE', 'Small Slant')),
        'Lando will only update you about new stable releases!',
        '',
      ].join(os.EOL);
  }
};

/*
 * Helper to show status of secret toggle
 */
exports.secretToggle = (on = false) => {
  switch (on) {
    case true:
      return [
        '',
        chalk.green(niceFont('Activated!!!', 'Small Slant')),
        chalk.magenta('The secret toggle is now ON'),
        '',
        `Rerun ${codeMe('lando')} to see the secret commands `,
        '',
      ].join(os.EOL);
    case false:
      return [
        '',
        chalk.red(niceFont('Deactivated!', 'Small Slant')),
        chalk.grey('The secret toggle is now OFF'),
        '',
      ].join(os.EOL);
  }
};

/*
 * Helper to show status of secret toggle
 */
exports.secretToggleDenied = (on = false) => [
  '',
  chalk.red(niceFont('Toggle Denied!', 'Small Slant', true)),
  '',
  chalk.magenta('You can only toggle the secret toggle when running Lando from source'),
  'See https://docs.lando.dev/contrib/activate.html',
  '',
].join(os.EOL);

/*
 * Sharing under construction
 */
exports.shareWait = () => [
  '',
  chalk.red(niceFont('OFFLINE!!!', 'ANSI Shadow')),
  '',
  'localtunnel.me has finally sunsetted it\'s free service. Lando thanks them for their great and free service.',
  '',
  'We are hard at work on a new sharing solution but it is not quite ready!',
  '',
  'Due to our massive user base we might not be able to offer free sharing to all users.',
  'So, if you are interested in using our new sharing service we recommend you sponsor at the link below!',
  chalk.green('https://lando.dev/sponsor'),
  '',
].join(os.EOL);

/*
 * Helper to show status of secret toggle
 */
exports.sudoRun = () => [
  chalk.red('Lando should never ever ever be run as root...'),
  chalk.magenta(niceFont('like ever!!!', 'Small Slant')),
].join(os.EOL);

/*
 * Helper to show status of secret toggle
 */
exports.tunnel = ({url, phase = 'pre'} = {}) => {
  switch (phase) {
    case 'pre':
      return chalk.cyan('About to share your app to a whole new world!');
    case 'post':
      return [
        '',
        chalk.magenta(niceFont('Connected!!!', 'Small Slant')),
        'A tunnel to your local Lando app been established.',
        '',
        'Here is your public url:',
        chalk.green(url),
        '',
        'Press any key to close the tunnel...',
      ].join(os.EOL);
    case 'closed':
      return chalk.green('Tunnel closed!');
  }
};

/*
 * Update available
 */
exports.updateAvailable = url => [
  '',
  chalk.magenta(niceFont('Update Available!!!', 'Small Slant')),
  '',
  'Updating helps us provide the best support and saves us tons of time',
  '',
  'Use the link below to get the latest and greatest',
  chalk.green(url),
  '',
  `Lando is ${chalk.bold('FREE')} and ${chalk.bold('OPEN SOURCE')} software that relies on contributions`
    + ` from developers like you!`,
  'If you like Lando then help us spend more time making, updating and supporting it by contributing at the link below',
  chalk.green('https://github.com/sponsors/lando'),
  '',
  'If you would like to customize the behavior of this message then check out:',
  chalk.green('https://docs.lando.dev/config/releases.html'),
].join(os.EOL);

exports.badToken = () => {
  return warningMessage({
    title: 'Invalid Machine Token',
    detail: [
      'Your machine token has been rejected by Pantheon. It may have been revoked or corrupted.',
      'Please use a different token.',
      'You can generate a new token using this link:',
    ],
    url: 'https://dashboard.pantheon.io/machine-token/create/Lando',
  });
};
