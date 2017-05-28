/**
 * @file
 * Hides the releases radio elements if only one release is available.
 */
(function ($) {

"use strict";

Backdrop.behaviors.installerSelectReleases = {
  attach: function (context, settings) {
    $('.installer-browser-releases-wrapper').hide();
    $('.installer-browser-selected-release').show();

    $('.installer-browser-show-releases-link').click(function (e) {
      var target = $(this).attr('rel');
      $('.installer-browser-release-' + target).show();
      $('.installer-browser-selected-release-' + target).hide();
      e.preventDefault();
      e.stopPropagation();
    })
  }
};

})(jQuery);
