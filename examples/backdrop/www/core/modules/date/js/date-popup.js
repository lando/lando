/**
 * Attaches the calendar behavior to all required fields
 */
(function($) {
  Backdrop.behaviors.datePopup = {
    attach: function (context) {
      var $context = $(context);
      $context.find('[data-date-popup]').once('date-popup').each(function() {
        bindFocusHandler(this, 'date-popup', 'datepicker');
      });
      $context.find('[data-timeentry]').once('timeentry').each(function() {
        bindFocusHandler(this, 'timeentry', 'timeEntry');
      });
      for (var id in Backdrop.settings.datePopup) {
        $('#'+ id).bind('focus', Backdrop.settings.datePopup[id], makeFocusHandler);
      }
    }
  };

  /**
   * Bind a handler for doing a date or time picker on element focus.
   *
   * This function ensures that an element will not bind the picker twice to
   * the same element. By waiting until element focus, this speeds up the
   * initial page load and only creates the picker when the element is first
   * given focus.
   *
   * @param element
   *   The input element that will receive the picker.
   * @param data_attribute
   *   The data attribute on this element that contains the picker
   *   configuration. For example if the configuration were in a data-date-popup
   *   attribute, the parameter would be 'date-popup'.
   * @param method
   *   The jQuery method to be called on the input element.
   */
  function bindFocusHandler(element, data_attribute, method) {
    var $element = $(element);
    $element.bind('focus', function() {
      if (!$element.hasClass('date-popup-init')) {
        $element[method]($element.data(data_attribute)).addClass('date-popup-init').trigger('focus');
      }
    });
  }
})(jQuery);
