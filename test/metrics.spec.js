/**
 * Tests for metrics system.
 * @file metrics.spec.js
 */

'use strict';

const _ = require('lodash');
const axios = require('axios');
const chai = require('chai');
const sinon = require('sinon');
const EventEmitter = require('events').EventEmitter;
const Promise = require('./../lib/promise');
chai.use(require('chai-as-promised'));
chai.should();

const Metrics = require('./../lib/metrics');

describe('metrics', () => {
  describe('#Metrics', () => {
    it('should return a Metrics instance with correct default options', () => {
      const metrics = new Metrics();
      metrics.should.be.instanceof(Metrics);
      metrics.should.have.property('id', 'unknown');
      metrics.endpoints.should.be.instanceof(Array);
      metrics.endpoints.should.be.empty;
      metrics.data.should.be.instanceof(Object);
      metrics.data.should.be.empty;
      metrics.log.should.be.instanceof(EventEmitter);
    });

    it('should return a Metrics instance with user options', () => {
      const metrics = new Metrics({id: '24601', endpoints: [1, 2], data: {prisoner: 'valjean'}});
      metrics.should.be.instanceof(Metrics);
      metrics.should.have.property('id', '24601');
      metrics.data.prisoner.should.equal('valjean');
      metrics.endpoints.should.have.length(2);
      metrics.endpoints.should.be.not.empty;
      metrics.data.should.be.not.empty;
      metrics.log.should.be.instanceof(EventEmitter);
    });
  });

  describe('#report', () => {
    it('should report to each report=true endpoint', () => {
      const endpoints = [
        {url: 'https://place.for.the.things/metrics', report: true},
        {url: 'https://place.for.more.things', report: true},
        {url: 'https://nsa.gov/prism', report: false},
      ];
      let counter = 0;
      const id = '24601';
      const reportable = _.size(_.filter(endpoints, endpoint => endpoint.report));
      const metrics = new Metrics({id, endpoints, data: {prisoner: 'valjean'}});
      sinon.stub(axios, 'create').callsFake(({baseURL = 'localhost'} = {}) => ({
        post: (path, data) => {
          baseURL.should.equal(endpoints[counter].url);
          path.should.equal('/metrics/v2/' + id);
          data.prisoner.should.equal('valjean');
          data.inspecter.should.equal('javier');
          data.created.should.be.not.empty;
          data.action.should.equal('escape');
          counter = counter + 1;
          return Promise.resolve();
        },
      }));
      return metrics.report('escape', {inspecter: 'javier'})
        .should.be.fulfilled
        .then(() => {
          counter.should.equal(reportable);
        })
        .then(() => axios.create.restore());
    });

    it('should log a failed report but not throw an error', () => {
      const endpoints = [
        {url: 'https://place.for.the.things/metrics', report: true},
        {url: 'https://place.for.more.things', report: true},
        {url: 'https://nsa.gov/prism', report: true},
      ];
      const reportable = _.size(_.filter(endpoints, endpoint => endpoint.report));
      const metrics = new Metrics({endpoints, log: {debug: sinon.spy(), verbose: sinon.spy()}});
      sinon.stub(axios, 'create').callsFake(() => ({
        post: () => Promise.reject(),
      }));
      return metrics.report()
        .then(() => {
          metrics.log.debug.callCount.should.equal(reportable + 1);
        })
        .should.be.fulfilled
        .then(() => axios.create.restore());
    });

    it('should properly reset the data from previous reports', () => {
      const endpoints = [{url: 'https://place.for.the.things/metrics', report: true}];
      const metrics = new Metrics({endpoints, data: {inspector: 'javier'}});
      sinon.stub(axios, 'create').callsFake(() => ({
        post: (path, data) => {
          if (data.action === 'escape') data.should.have.property('freedman', 'valjean');
          if (data.action === 'apprehended') data.should.not.have.property('freedman');
          return Promise.resolve();
        },
      }));
      return metrics.report('escape', {freedman: 'valjean'})
        .delay(5)
        .then(() => metrics.report('apprehended', {prisoner: 'valjean'}))
        .then(() => axios.create.restore());
    });
  });
});
