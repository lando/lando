(function ($) {

/**
 * Collapses table rows followed by group rows on the test listing page.
 */
Backdrop.behaviors.simpleTestGroupCollapse = {
  attach: function (context, settings) {
      $(context).find('.simpletest-group').once('simpletest-group-collapse', function () {
        var $group = $(this);
        var $image = $group.find('.simpletest-image');
        $image
          .html(Backdrop.settings.simpleTest.images[0])
          .on('click', function () {
            var $tests = $group.nextUntil('.simpletest-group');
            var expand = !$group.hasClass('expanded');
            $group.toggleClass('expanded', expand);
            $tests.toggleClass('js-hide', !expand);
            $image.html(Backdrop.settings.simpleTest.images[+expand]);
          });
    });
  }
};

/**
 * Toggles test checkboxes to match the group checkbox.
 */
Backdrop.behaviors.simpleTestSelectAll = {
  attach: function (context, settings) {
    $(context).find('.simpletest-group').once('simpletest-group-select-all', function () {
      var $group = $(this);
      var $cell = $group.find('.simpletest-group-select-all');
      var $groupCheckbox = $('<input type="checkbox" id="' + $cell.attr('id') + '-group-select-all" class="form-checkbox" />');
      var $testCheckboxes = $group.nextUntil('.simpletest-group').find('input[type=checkbox]');
      $cell.append($groupCheckbox);

      // Toggle the test checkboxes when the group checkbox is toggled.
      $groupCheckbox.on('change', function () {
        var checked = $(this).prop('checked');
        $testCheckboxes.prop('checked', checked);
      });

      // Update the group checkbox when a test checkbox is toggled.
      function updateGroupCheckbox() {
        var allChecked = true;
        $testCheckboxes.each(function () {
          if (!$(this).prop('checked')) {
            allChecked = false;
            return false;
          }
        });
        $groupCheckbox.prop('checked', allChecked);
      }

      $testCheckboxes.on('change', updateGroupCheckbox);
    });
  }
};

})(jQuery);
