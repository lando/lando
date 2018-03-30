/**
* Tests for tasks module.
* @file tasks.spec.js
*/

'use strict';

const chai = require('chai');
chai.should();

const tasks = require('./../../lib/tasks');

describe('tasks', () => {
  describe('#add', () =>  {
    it('Adds tasks to tasks collection', () => {
      tasks.add('El Scorcho', {
        command: 'elscorcho [appname]',
        describe: 'Don red hair and say that [appname] shreds the cello',
        options: {
          jello: {
            describe: 'Makes [appname] jello, baby',
            alias: ['j'],
            default: false,
            boolean: true,
            interactive: {
              type: 'confirm',
              message: 'Are you sure you are jello?'
            }
          }
        },
        run: function(options) {
          console.log(options);
        }
      });
      tasks.tasks[0].should.have.property('name', 'El Scorcho');
    });
  });
});
