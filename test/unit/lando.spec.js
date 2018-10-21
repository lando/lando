/**
 * Tests for lando system.
 * @file lando.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const filesystem = require('mock-fs');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Lando = require('./../../lib/lando');
chai.use(require('chai-as-promised'));
chai.should();

// This is the file we are testing
describe('lando', () => {
  describe('#Lando', () => {
    // @todo: do we need a stronger test? presumably downstream requires handle that?
    it('should return a Lando instance with correct default options', () => {
      const lando = new Lando();
      lando.should.be.an('object');
    });

    it('should use prexisting instance id if possible', () => {
      filesystem({
        '/tmp/cache/id': '"24601"',
      });
      const lando = new Lando({userConfRoot: '/tmp'});
      lando.config.id.should.equal('24601');
      lando.config.user.should.equal('24601');
      filesystem.restore();
    });

    it('should set and persitent cache an instance id if needed', () => {
      filesystem();
      const lando = new Lando({userConfRoot: os.tmpdir()});
      const idPath = path.join(lando.config.userConfRoot, 'cache', 'id');
      fs.existsSync(idPath).should.be.true;
      lando.cache.get('id').should.equal(lando.config.id);
      filesystem.restore();
    });

    it('should send messages', () => {
      const lando = new Lando();
      lando.events.on('message', message => {
        message.should.be.an('object');
        message.should.have.property('context', 'core');
        message.should.have.property('type', 'info');
        message.meta.should.equal('data');
      });
      lando.message({meta: 'data'});
    });
  });
});
