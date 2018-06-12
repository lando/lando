/*
 * Tests for lando-engine:utils.
 * @file utils.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

const utils = require('./../../lib/utils');

describe('lando-engine.utils', () => {
  describe('#dockerComposify', () => {
    it('#dockerComposify should return a string.', () => {
      const data = 'a testing string';
      const dockerComposifyResult = utils.dockerComposify(data);
      expect(dockerComposifyResult).to.be.a('string');
    });
  });

  describe('#escSpaces', () => {
    it('#escSpaces should return a string.', () => {
      const s = ['a testing string.', 'another testing string.'];
      const platform = 'win32';
      const escSpacesResult = utils.escSpaces(s, platform);
      expect(escSpacesResult).to.be.a('string');
    });
  });

  describe('#getId', () => {
    it('#getId should return a string.', () => {
      const c = {'cid': 'a string'};
      const getIdResult = utils.getId(c);
      expect(getIdResult).to.be.a('string');
     });
   });

   describe('#normalizer', () => {
     it('#normalizer should return an array.', () => {
       const data = ['some data'];
       let normalizerResult = utils.normalizer(data);
       expect(normalizerResult).to.be.an('array');

       normalizerResult = utils.normalizer('string data');
       expect(normalizerResult).to.be.an('array');
     });
   });

  describe('#moveConfig', () => {
    it('#moveConfig if cannot mv config throw an error.', () => {
      expect(() => {
        utils.moveConfig(
          './compose.spec.js',
          'tostring'
        );
      }).to.throw(Error);
    });
  });
});

