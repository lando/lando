(function ($) {

"use strict";

Backdrop.behaviors.toggles = {
  attach: function(context, settings) {
    var $toggles = $(context).find('[data-toggle]').once('toggle');

    $toggles.click(function(){
      var $this = $(this);
      var $target = $('[data-toggleable="' + $this.attr('data-toggle') + '"]');
      $target.toggleClass('js-toggled');
    });
  }
};

/**
 * Override tableDragHandle().
 */
Backdrop.theme.prototype.tableDragHandle = function() {
  return '<a href="#" title="' + Backdrop.t('Drag to re-order') + '" class="tabledrag-handle"><div class="handle"><div class="handle-inner">&nbsp;</div></div></a>';
};

/**
 * Tests for background-blend-mode used on some hero elements
 *
 * @return {boolean} True if browser supports background-blend-mode.
 *
 */
Backdrop.featureDetect.backgroundBlendMode = function() {
  var $body = $('body'),
  $testElement = $('<div style="background-blend-mode: luminosity; width: 0; height: 0;"></div>');

  if ($body.hasClass('has-background-blend-mode')) {
    return true;
  } else if ($body.hasClass('no-background-blend-mode')) {
    return false;
  } else {
    $body.append($testElement);
    if ($testElement.css('background-blend-mode') === 'luminosity') {
      $('body').addClass('has-background-blend-mode');
      $testElement.remove();
      return true;
    }
    else {
      $body.addClass('no-background-blend-mode');
      $testElement.remove();
      return false;
    }
  }
}

$(document).ready(function() {
  Backdrop.featureDetect.backgroundBlendMode();
  Backdrop.featureDetect.flexbox();
});

})(jQuery);
