'use strict';

exports.unsupportedServices = (services = '') => ({
  title: 'Detected some unsupported Lagoon services',
  detail: [
    'Lando has detected some services in your Lagoon config are not yet supported.',
    'This may result in reduced functionality for your app.',
    `The unsupported services are: ${services}`,
    'See below for more details:',
  ],
  url: 'https://docs.lando.dev/config/lagoon.html#customizing-the-stack',
});

