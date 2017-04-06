/**
* @file
* Open all external links in a dialog.
*
* Inspired by https://css-tricks.com/snippets/jquery/open-external-links-in-new-window/
*/
(function ($) {

"use strict";

Backdrop.behaviors.installerProjectList = {
  attach: function(context, settings) {
    // On mobile add an indicator of number of projects installed and scroll to
    // installation queue on click.
    updateTableHeader();

    /**
     * Update the table header installation links for mobile.
     */
    function updateTableHeader() {
      var itemCount = $('.installer-browser-install-queue-item').length;
      var $header = $(".installer-browser-main th");
      $(".projects-selected").remove();
      if (window.innerWidth < 768 && itemCount > 0) {
        $header.append('<span class="projects-selected">: ' + Backdrop.formatPlural(itemCount, '@count item selected.', '@count items selected.') + '<a class="installer-status-count-link" href="#">' + Backdrop.t('Review and install') + '</a></span>');
      }
    }

    // Update the table header after any AJAX event completes.
    $(document).ajaxComplete(function() {
      updateTableHeader();
    });

    // Update the table header on window resize.
    Backdrop.optimizedResize.add(updateTableHeader);

    $('body').once('installer-status-count').on('click', '.installer-status-count-link', function(event) {
      event.preventDefault();
      event.stopPropagation();
      $('html, body').animate({
        scrollTop: $(".installer-browser-list-sidebar").offset().top
      }, 400);
    });
  }
};

// Open all links in dialogs in a new window.
$(window).on('dialog:aftercreate', function(e, dialog, $element, settings) {
  $element.find('a').each(function() {
    var a = new RegExp('/' + window.location.host + '/');
    if (!a.test(this.href)) {
      $(this).attr("target", "_blank");
    }
  });
});

})(jQuery);
