'use strict';

/*
 * Helper to set default php version based on framework
 */
exports.getPhpVersion = (framework = 'wordpress') => {
  switch (framework) {
    case 'backdrop': return '7.2';
    case 'drupal': return '5.6';
    case 'drupal8': return '7.2';
    case 'wordpress': return '7.2';
  }
};
