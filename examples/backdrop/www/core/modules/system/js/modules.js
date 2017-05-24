(function ($) {

/**
 * Filters the module list table by a text input search string.
 *
 * Additionally accounts for multiple tables being wrapped in "package" fieldset
 * elements.
 */
Backdrop.behaviors.moduleFilterByText = {
  attach: function(context, settings) {
    var $input = $('input.table-filter-text').once('table-filter-text');
    var $form = $('#system-modules');
    var $rowsAndFieldsets, $rows, $fieldset;

    // Hide the module requirements.
    $form.find('.requirements').hide();

    // Toggle the requirements info.
    $('a.requirements-toggle').click(function(e) {
      var $requirements = $(this).closest('td').find('.requirements').toggle();
      if ($requirements.is(':visible')) {
        $(this).text(Backdrop.t('less'));
      }
      else {
        $(this).text(Backdrop.t('more'));
      }
      e.preventDefault();
      e.stopPropagation();
    });

    // Hide the package <fieldset> if it doesn't have any visible rows within.
    function hidePackageFieldset(index, element) {
      var $fieldset = $(element);
      var $visibleRows = $fieldset.find('table:not(.sticky-header)').find('tbody tr:visible');
      $fieldset.toggle($visibleRows.length > 0);
    }

    // Fliter the list of modules by provided search string.
    function filterModuleList() {
      var query = $input.val().toLowerCase();

      function showModuleRow(index, row) {
        var $row = $(row);
        var $sources = $row.find('.table-filter-text-source');
        var textMatch = $sources.text().toLowerCase().indexOf(query) !== -1;
        $row.closest('tr').toggle(textMatch);
      }

      // Filter only if the length of the query is at least 2 characters.
      if (query.length >= 2) {
        $rows.each(showModuleRow);

        // We first show() all <fieldset>s to be able to use ':visible'.
        $fieldset.show().each(hidePackageFieldset);

        if ($fieldset.filter(':visible').length === 0) {
          if ($('.filter-empty').length === 0) {
            $('#edit-filter').append('<p class="filter-empty">' + Backdrop.t('There were no results.') + '</p>');
          }
        }
        else {
          $('.filter-empty').remove();
        }
      }
      else {
        $rowsAndFieldsets.show();
        $('.filter-empty').remove();
      }
    }

    if ($form.length) {
      $rowsAndFieldsets = $form.find('tr, fieldset');
      $rows = $form.find('tbody tr');
      $fieldset = $form.find('fieldset');

      // @todo Use autofocus attribute when possible.
      $input.focus().on('keyup', filterModuleList);
    }
  }
};

})(jQuery);
