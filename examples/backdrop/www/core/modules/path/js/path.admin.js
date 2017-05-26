/**
 * @file
 * Behaviors for Path module's administration pages.
 */

(function ($) {

"use strict";

/**
 * Manages checkboxes for Update URL Aliases (bulk-update) page.
 */
Backdrop.behaviors.pathGenerate = {
  attach: function (context) {
    var $form = $(context).find('#path-bulk-update-form').once('path-generate');
    if ($form.length === 0) {
      return;
    }

    // When you select an entity checkbox (like "content"), select the 
    // checkboxes for all the subtypes
    $form.find("input.path-base").change(function () {
      var type = $(this).attr('data-path-type');
      $("input.path-type[data-path-type='"+type+"']").prop('checked', this.checked);
    });

    $form.find("input.path-type").change(function () {
      var type = $(this).attr('data-path-type');
      var $base = $("input.path-base[data-path-type='"+type+"']");
      // If you uncheck a subtype checkbox, uncheck the entity checkbox.
      if($(this).is(":checked") == false) {
        $base.prop('checked', false);
        $("input.select-all-alias").prop('checked', false);
      }
      // If all subtype checkboxes checked, check the base checkbox.
      else {
        var unchecked = $("input.path-type[data-path-type='"+type+"']:checkbox:not(:checked)");
        if(unchecked.length < 1) {
          $base.prop('checked', true);
        }
      }
    });

    // Add check all checkboxes in the table head row.
    var strings = { 'selectAll': Backdrop.t('Select all rows in this table'), 'selectNone': Backdrop.t('Deselect all rows in this table') };
    $form.find('th.path-alias-generate').prepend($('<input type="checkbox" class="select-all-alias form-checkbox" />').attr('title', strings.selectAll)).click(function (event) {
      if ($(event.target).is('input[type="checkbox"]')) {
        $form.find("input.path-type, input.path-base").each(function () {
          $(this).prop('checked', event.target.checked);
        });
      }
    });

    // Uncheck the "select all" checkboxes if not all checkboxes checked.
    $form.find('input[type="checkbox"]').change(function () {
      var uncheckedAll = ($form.find("input.path-type:checkbox:not(:checked)").length)+($("input.path-base:checkbox:not(:checked)").length);
      $form.find("input.select-all-alias").prop('checked', uncheckedAll<1);
    });

  }
};
})(jQuery);
