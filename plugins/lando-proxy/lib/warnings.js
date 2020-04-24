'use strict';

exports.cannotStartProxyWarning = message => ({
  title: 'Lando was not able to start the proxy',
  detail: [
    `${message}`,
    'The proxy has been disabled for now so you can continue to work.',
    'Check out the docs below, resolve your issue and build this app',
  ],
  url: 'https://docs.lando.dev/config/proxy.htm',
});

exports.unknownServiceWarning = service => ({
  title: 'Proxying to unknown service!',
  detail: [
    `${service} is a service that does not exist in your app!!!`,
    'This means we have not been able to set up your proxy route',
    'We recommend running the below command to see the services for this app',
  ],
  command: `lando info`,
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
