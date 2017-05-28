(function ($) {

/**
 * Attaches language support to the jQuery UI datepicker component.
 */
Backdrop.behaviors.localeDatepicker = {
  attach: function(context, settings) {
    // This code accesses Backdrop.settings and localized strings via Backdrop.t().
    // So this code should run after these are initialized. By placing it in an
    // attach behavior this is assured.
    $.datepicker.regional['backdrop-locale'] = $.extend({
      closeText: Backdrop.t('Done'),
      prevText: Backdrop.t('Prev'),
      nextText: Backdrop.t('Next'),
      currentText: Backdrop.t('Today'),
      monthNames: [
        Backdrop.t('January', {}, {context: "Long month name"}),
        Backdrop.t('February', {}, {context: "Long month name"}),
        Backdrop.t('March', {}, {context: "Long month name"}),
        Backdrop.t('April', {}, {context: "Long month name"}),
        Backdrop.t('May', {}, {context: "Long month name"}),
        Backdrop.t('June', {}, {context: "Long month name"}),
        Backdrop.t('July', {}, {context: "Long month name"}),
        Backdrop.t('August', {}, {context: "Long month name"}),
        Backdrop.t('September', {}, {context: "Long month name"}),
        Backdrop.t('October', {}, {context: "Long month name"}),
        Backdrop.t('November', {}, {context: "Long month name"}),
        Backdrop.t('December', {}, {context: "Long month name"})
      ],
      monthNamesShort: [
        Backdrop.t('Jan'),
        Backdrop.t('Feb'),
        Backdrop.t('Mar'),
        Backdrop.t('Apr'),
        Backdrop.t('May'),
        Backdrop.t('Jun'),
        Backdrop.t('Jul'),
        Backdrop.t('Aug'),
        Backdrop.t('Sep'),
        Backdrop.t('Oct'),
        Backdrop.t('Nov'),
        Backdrop.t('Dec')
      ],
      dayNames: [
        Backdrop.t('Sunday'),
        Backdrop.t('Monday'),
        Backdrop.t('Tuesday'),
        Backdrop.t('Wednesday'),
        Backdrop.t('Thursday'),
        Backdrop.t('Friday'),
        Backdrop.t('Saturday')
      ],
      dayNamesShort: [
        Backdrop.t('Sun'),
        Backdrop.t('Mon'),
        Backdrop.t('Tue'),
        Backdrop.t('Wed'),
        Backdrop.t('Thu'),
        Backdrop.t('Fri'),
        Backdrop.t('Sat')
      ],
      dayNamesMin: [
        Backdrop.t('Su'),
        Backdrop.t('Mo'),
        Backdrop.t('Tu'),
        Backdrop.t('We'),
        Backdrop.t('Th'),
        Backdrop.t('Fr'),
        Backdrop.t('Sa')
      ],
      dateFormat: Backdrop.t('mm/dd/yy'),
      firstDay: 0,
      isRTL: 0
    }, Backdrop.settings.jquery.ui.datepicker);
    $.datepicker.setDefaults($.datepicker.regional['backdrop-locale']);
  }
};

})(jQuery);
