'use strict';

module.exports = lando => {
  return {
    command: 'poweroff',
    level: 'engine',
    describe: 'Spins down all lando related containers',
    run: () => {
      console.log(lando.cli.makeArt('poweroff', {phase: 'pre'}));
      // Get all our containers
      return lando.engine.list()
      // SHUT IT ALL DOWN
      .each(container => console.log('Bye bye %s ... ', container.name))
      .delay(200)
      .map(container => lando.engine.stop({id: container.id}))
      // Emit poweroff
      .then(() => lando.events.emit('poweroff'))
      // Finish up
      .then(() => console.log(lando.cli.makeArt('poweroff', {phase: 'post'})));
    },
  };
};
