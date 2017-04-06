/**
 * @file
 * Attaches behaviors for the Path module.
 */
(function ($) {

"use strict";

Backdrop.behaviors.pathFieldsetSummaries = {
  attach: function (context) {
    $(context).find('fieldset.path-form').backdropSetSummary(function (element) {
      var $element = $(element);
      var path = $element.find('[name="path[alias]"]').val();
      var automatic = $element.find('[name="path[auto]"]').prop('checked');

      if (automatic) {
        return Backdrop.t('Automatic alias');
      }
      if (path) {
        return Backdrop.t('Alias: @alias', { '@alias': path });
      }
      else {
        return Backdrop.t('No alias');
      }
    });
  }
};

})(jQuery);
