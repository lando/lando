(function ($) {

/**
 * Move a block in the blocks table from one region to another via select list.
 *
 * This behavior is dependent on the tableDrag behavior, since it uses the
 * objects initialized in that behavior to update the row.
 */
Backdrop.behaviors.termDrag = {
  attach: function (context, settings) {
    var table = $('#taxonomy', context);
    var tableDrag = Backdrop.tableDrag.taxonomy; // Get the blocks tableDrag object.
    var rows = $('tr', table).length;

    // When a row is swapped, keep previous and next page classes set.
    tableDrag.row.prototype.onSwap = function (swappedRow) {
      $('tr.taxonomy-term-preview', table).removeClass('taxonomy-term-preview');
      $('tr.taxonomy-term-divider-top', table).removeClass('taxonomy-term-divider-top');
      $('tr.taxonomy-term-divider-bottom', table).removeClass('taxonomy-term-divider-bottom');

      if (settings.taxonomy.backStep) {
        for (var n = 0; n < settings.taxonomy.backStep; n++) {
          $(table[0].tBodies[0].rows[n]).addClass('taxonomy-term-preview');
        }
        $(table[0].tBodies[0].rows[settings.taxonomy.backStep - 1]).addClass('taxonomy-term-divider-top');
        $(table[0].tBodies[0].rows[settings.taxonomy.backStep]).addClass('taxonomy-term-divider-bottom');
      }

      if (settings.taxonomy.forwardStep) {
        for (var k = rows - settings.taxonomy.forwardStep - 1; k < rows - 1; k++) {
          $(table[0].tBodies[0].rows[k]).addClass('taxonomy-term-preview');
        }
        $(table[0].tBodies[0].rows[rows - settings.taxonomy.forwardStep - 2]).addClass('taxonomy-term-divider-top');
        $(table[0].tBodies[0].rows[rows - settings.taxonomy.forwardStep - 1]).addClass('taxonomy-term-divider-bottom');
      }
    };
  }
};

})(jQuery);
