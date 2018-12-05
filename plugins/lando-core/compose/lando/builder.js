'use strict';

/*
 * The lowest level class from which all other services and recipes are built on
 * @TODO: presumably this will get larger over time as we add more options
 */
module.exports = {
  name: 'lando',
  parent: 'compose',
  builder: parent => class LandoService extends parent {
    constructor(fucker = 'stuff') {
      super('hreherh', {services: {fuck: {}}}, {env: {FUCK: fucker}});
    };
  },
};
