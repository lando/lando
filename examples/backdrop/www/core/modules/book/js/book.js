(function ($) {

Backdrop.behaviors.bookFieldsetSummaries = {
  attach: function (context) {
    $('fieldset.book-outline-form', context).backdropSetSummary(function (context) {
      var $select = $(context).find('.book-title-select');
      var val = $select.val();

      if (val === '0') {
        return Backdrop.t('Not in book');
      }
      else if (val === 'new') {
        return Backdrop.t('New book');
      }
      else {
        return Backdrop.checkPlain($select.find(':selected').text());
      }
    });
  }
};

})(jQuery);
