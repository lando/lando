(function ($) {

Backdrop.behaviors.contentTypes = {
  // Provide the vertical tab summaries.
  attach: function (context) {
    var $context = $(context);

    // Permissions settings. List any permission name that has at least one
    // permission checked.
    $context.find('#edit-permissions').backdropSetSummary(function(context) {
      var permissionNames = [];
      var checkedColumns = [];
      var extraPermissions = 0;
      var columnOffset, $cell;

      // Find all checked boxes and save the column number.
      $(context).find('input:checked:visible').each(function() {
        $cell = $(this).closest('td');
        columnOffset = $cell.closest('tr').children('td').index($cell);
        if (checkedColumns.indexOf(columnOffset) === -1) {
          checkedColumns.push(columnOffset);
        }
      });
      // Sort by column number.
      checkedColumns.sort();

      // Replace the column number with permission names.
      for (var n = 0; n < checkedColumns.length; n++) {
        if (permissionNames.length < 3) {
          permissionNames.push($(context).find('th').eq(checkedColumns[n]).text());
        }
        else {
          extraPermissions++;
        }
      }
      // If 4 permissions only, add the last one.
      if (extraPermissions === 1) {
        permissionNames.push($(context).find('th').eq(checkedColumns[n - 1]).text());
      }
      // If more than 4, show the first 3 and then a count of others.
      else if (extraPermissions >= 2) {
        permissionNames.push(Backdrop.t('@count other roles', { '@count': extraPermissions }));
      }
      return permissionNames.length ? permissionNames.join(', ') : Backdrop.t('No permissions set');
    });

    // Path settings.
    $context.find('#edit-path').backdropSetSummary(function(context) {
      var vals = [];
      vals.push(Backdrop.checkPlain($(context).find('input[name="path_pattern"]').val()) || Backdrop.t('No URL alias pattern set'));
      return vals.join(', ');
    });
  }
};

})(jQuery);
