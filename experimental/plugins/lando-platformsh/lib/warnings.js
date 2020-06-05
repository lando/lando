'use strict';

exports.unsupportedServices = (services = '') => ({
  title: 'Unsupported Platform.sh services detected',
  detail: [
    'Lando has detected services in your Platform.sh config which are not yet supported.',
    'This may result in errors or reduced functionality.',
    `The unsupported services are: ${services}`,
    'See the documentation below for more detail:',
  ],
  url: 'https://docs.lando.dev/config/platformsh.html#configuration',
});
