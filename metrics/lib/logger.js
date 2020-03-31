'use strict';

const _ = require('lodash');
const winston = require('winston');
const log = new winston.Logger({
  transports: [
    new winston.transports.Console({colorize: true}),
  ],
});

/*
 * Add a request logger method
 */
log.request = req => {
  log.info(
    '%s request to %s with body %j',
    _.get(req, 'method', 'UNKNOWN'),
    _.get(req, 'url', 'UNKNOWN'),
    _.get(req, 'body', {})
  );
};

/*
 * Add a request logger method
 */
log.response = (res, type = 'info', data = {}) => {
  log[type]('Responded with %s: %s',
    _.get(res, 'statusCode', 'UNKNOWN'),
    _.get(res, 'statusMessage', 'UNKNOWN')
  );
  log[type](data);
};

/*
 * Return the log
 */
module.exports = log;


