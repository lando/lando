/**
 * Tests for url scanning
 * @file scan.spec.js
 */

'use strict';

const _ = require('lodash');
const axios = require('axios');
const chai = require('chai');
const sinon = require('sinon');
const Promise = require('./../lib/promise');
chai.use(require('chai-as-promised'));
chai.should();

describe('scan', () => {
  describe('#scanUrls', () => {
    beforeEach(() => {
      let counter = {};
      sinon.stub(axios, 'create').callsFake(() => ({
        get: url => {
          counter[url] = counter[url] + 1 || 0;
          const last = _.last(url.split('.'));
          let code = 200;
          if (_.includes(last, ':')) {
            if (_.toInteger(last.split(':')[1]) === counter[url]) code = 200;
            else code = last.split(':')[0];
          } else {
            code = isFinite(_.last(url.split('.'))) ? _.last(url.split('.')) : 200;
          }
          return (_.startsWith(code, 2)) ? Promise.resolve() : Promise.reject({response: {status: _.toInteger(code)}});
        },
      }));
    });

    it('should return "good" status objects on status code 2xx', () => {
      const scan = require('./../lib/scan')();
      const urls = ['http://www.thecultofscottbakula.com', 'http://anumalak.com:'];
      return scan(urls)
        .each(result => {
          result.status.should.be.true;
          result.color.should.equal('green');
        })
        .should.be.fulfilled;
    });

    // @todo: should these return good?
    it('should return "good" status objects on non-wait codes', () => {
      const scan = require('./../lib/scan')();
      const urls = ['http://thecultofscottbakula.com:503', 'http://anumalak.com:503'];
      return scan(urls)
        .each(result => {
          result.status.should.be.true;
          result.color.should.equal('green');
        })
        .should.be.fulfilled;
    });

    it('should return "ok" status objects on wildcard entries', () => {
      const scan = require('./../lib/scan')();
      const urls = ['http://*.thecultofscottbakula.com', 'http://*.anumalak.com:'];
      return scan(urls)
        .each(result => {
          result.status.should.be.true;
          result.color.should.equal('yellow');
        })
        .should.be.fulfilled;
    });

    it('should return "bad" status objects on wait codes that don\'t change after max retries', () => {
      const scan = require('./../lib/scan')();
      const urls = ['http://thecultofscottbakula.com.666', 'http://anumalak.com.404'];
      return scan(urls, {max: 1, waitCodes: [666, 404]})
        .each(result => {
          result.status.should.be.false;
          result.color.should.equal('red');
        })
        .should.be.fulfilled;
    });

    it('should return "good" status objects on wait codes that become non-wait codes after retry', () => {
      const scan = require('./../lib/scan')();
      const urls = ['http://thecultofscottbakula.com.666:2'];
      return scan(urls, {max: 2, waitCodes: [666]})
        .each(result => {
          result.status.should.be.true;
          result.color.should.equal('green');
        })
        .should.be.fulfilled;
    });

    afterEach(() => {
      axios.create.restore();
    });
  });
});
