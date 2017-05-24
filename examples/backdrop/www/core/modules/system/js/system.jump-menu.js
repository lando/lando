/**
 * @file
 * JavaScript companion to the system_jump_menu form.
 */
(function($) {
  Backdrop.behaviors.jumpMenu = {
    attach: function(context) {
      $('.jump-menu-hide')
          .once('jump-menu')
          .hide();

      $('.jump-menu-change')
          .once('jump-menu')
          .change(function() {
            var loc = $(this).val();
            var urlArray = loc.split('::');
            if (urlArray[1]) {
              location.href = urlArray[1];
            }
            else {
              location.href = loc;
            }
            return false;
          });

      $('.jump-menu-button')
          .once('jump-menu')
          .click(function() {
            // Instead of submitting the form, just perform the redirect.

            // Find our sibling value.
            var $select = $(this).parents('form').find('.jump-menu-select');
            var loc = $select.val();
            var urlArray = loc.split('::');
            if (urlArray[1]) {
              location.href = urlArray[1];
            }
            else {
              location.href = loc;
            }
            return false;
          });
    }
  }
})(jQuery);
