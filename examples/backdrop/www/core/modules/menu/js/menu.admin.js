(function ($) {

Backdrop.behaviors.menuAdminFieldsetSummaries = {
  attach: function (context) {
    var $context = $(context);
    $context.find('#edit-menu').backdropSetSummary(function () {
      var $enabledMenus = $context.find('.form-item-menu-options input:checked');
      if ($enabledMenus.length) {
        var vals = [];
        $enabledMenus.each(function(n, checkbox) {
          vals.push($(checkbox).siblings('label').text());
        });
        return vals.join(', ');
      }
      else {
        return Backdrop.t('Disabled');
      }
    });
  }
};

Backdrop.behaviors.menuChangeParentItems = {
  attach: function (context, settings) {
    $('fieldset#edit-menu input').each(function () {
      $(this).change(function () {
        // Update list of available parent menu items.
        Backdrop.menu_update_parent_list();
      });
    });
  }
};

/**
 * Function to set the options of the menu parent item dropdown.
 */
Backdrop.menu_update_parent_list = function () {
  var values = [];

  $('input:checked', $('fieldset#edit-menu')).each(function () {
    // Get the names of all checked menus.
    values.push(Backdrop.checkPlain($.trim($(this).val())));
  });

  var url = Backdrop.settings.basePath + 'admin/structure/menu/parents';
  $.ajax({
    url: location.protocol + '//' + location.host + url,
    type: 'POST',
    data: {'menus[]' : values},
    dataType: 'json',
    success: function (options) {
      // Save key of last selected element.
      var selected = $('fieldset#edit-menu #edit-menu-parent :selected').val();
      // Remove all exisiting options from dropdown.
      var selectForm = $('fieldset#edit-menu #edit-menu-parent');
      selectForm.children().remove();
      // Add new options to dropdown.
      jQuery.each(options, function(index, value) {
        $('fieldset#edit-menu #edit-menu-parent').append(
          $('<option ' + (index == selected ? ' selected="selected"' : '') + '></option>').val(index).text(value)
        );
      });
      // Hide Default parent item form if empty.
      var menuParent = selectForm.parents('.form-item-menu-parent');
      if (selectForm.children().length === 0) {
        menuParent.hide();
      }
      else {
        menuParent.show();
      }
    }
  });
};

})(jQuery);
