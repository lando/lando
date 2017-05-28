/**
 * @file
 * Attaches behaviors for the Redirect module.
 */
(function ($) {

"use strict";

Backdrop.behaviors.redirectFieldsetSummaries = {
  attach: function (context) {
    $('fieldset.redirect-list', context).backdropSetSummary(function (context) {
      if ($('table.redirect-list tbody td.empty', context).length) {
        return Backdrop.t('No redirects');
      }
      else {
        var redirects = $('table.redirect-list tbody tr', context).length;
        return Backdrop.formatPlural(redirects, '1 redirect', '@count redirects');
      }
    });
  }
};

})(jQuery);
