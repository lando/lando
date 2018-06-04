'use strict';

const _ = require('lodash');
exports.escapedAnchor = anchor => (typeof anchor !== 'string') ? null : _.toLower(anchor.replace(/\W/g, ''));
