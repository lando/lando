'use strict';

/*
 * Init Magento
 */
module.exports = {
  name: 'magento',
  overrides: {
    webroot: {
      when: answers => {
        answers.webroot= 'pub';
        return false;
      },
    },
  },
};
