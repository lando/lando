'use strict';

exports.maxKeyWarning = () => ({
  title: 'You have a lot of keys!',
  detail: [
    'Lando has detected you have a lot of ssh keys.',
    'This may cause "Too many authentication failures" errors.',
    'We recommend you limit your keys. See below for more details:',
  ],
  url: 'https://docs.lando.dev/config/ssh.html#customizing',
});

exports.rebuildWarning = () => ({
  title: 'This app was built on a different version of Lando.',
  detail: [
    'While it may not be necessary, we highly recommend you update the app.',
    'This ensures your app is up to date with your current Lando version.',
    'You can do this with the command below:',
  ],
  command: 'lando rebuild',
});

exports.serviceNotRunningWarning = service => ({
  title: `The service "${service}" is not running!`,
  detail: ['This is likely a critical problem and we recommend you run the command below to investigate'],
  command: `lando logs -s ${service}`,
});

exports.serviceUnhealthyWarning = service => ({
  title: `The service "${service}" failed its healthcheck`,
  detail: ['This may be ok but we recommend you run the command below to investigate:'],
  command: `lando logs -s ${service}`,
});
