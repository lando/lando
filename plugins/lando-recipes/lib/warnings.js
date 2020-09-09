'use strict';

// Modules

exports.drushWarn = version => ({
  title: 'May need site-local drush',
  detail: [
    `Lando has detected you are trying to globally install drush ${version}`,
    'This version of drush prefers a site-local installation',
    'We recommend you install drush that way, see:',
  ],
  url: 'https://www.drush.org/install/',
});
