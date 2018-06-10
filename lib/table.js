const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const OldTable = require('cli-table');

module.exports = class Table extends OldTable {
  constructor(opts = {}) {
    const tableDefaults = {
      chars: {
        'top': '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': '',
      },
    };
    super(_.merge({}, tableDefaults, opts));
  };

  // Add a push method
  add(key, value, {arrayJoiner = ', '} = {}) {
    // Do some special things for arrays
    if (_.isArray(value)) value = value.join(arrayJoiner);
    // Do the normal push
    this.push([chalk.cyan(key), value]);
  };
};
