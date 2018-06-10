const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const OldTable = require('cli-table');

/**
 * Utility function to help construct CLI displayable tables
 *
 * @since 3.0.0
 * @alias lando.cli.Table
 * @param {Object} [opts] Options for how the table should be built
 * @param {String} [opts.arrayJoiner=', '] A delimiter to be used when joining array data
 * @return {Object} Table metadata that can be printed with toString()
 * @example
 * // Grab a new cli table
 * const table = new lando.cli.Table();
 *
 * // Add data
 * table.add('NAME', app.name);
 * table.add('LOCATION', app.root);
 * table.add('SERVICES', _.keys(app.services));
 * table.add('URLS', urls, {arrayJoiner: '\n'});
 *
 * // Print the table
 * console.log(table.toString());
 */
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
