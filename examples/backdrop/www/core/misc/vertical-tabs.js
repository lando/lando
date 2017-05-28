(function ($) {

/**
 * This script transforms a set of fieldsets into a stack of vertical
 * tabs. Another tab pane can be selected by clicking on the respective
 * tab.
 *
 * Each tab may have a summary which can be updated by another
 * script. For that to work, each fieldset has an associated
 * 'verticalTabCallback' (with jQuery.data() attached to the fieldset),
 * which is called every time the user performs an update to a form
 * element inside the tab pane.
 */
Backdrop.behaviors.verticalTabs = {
  attach: function (context) {
    $('.vertical-tabs-panes', context).once('vertical-tabs', function () {
      var focusID = $(':hidden.vertical-tabs-active-tab', this).val();
      var tab_focus;

      // Check if there are some fieldsets that can be converted to vertical-tabs
      var $fieldsets = $('> fieldset', this);
      if ($fieldsets.length == 0) {
        return;
      }

      // Create the tab column.
      var tab_list = $('<ul class="vertical-tabs-list"></ul>');
      $(this).wrap('<div class="vertical-tabs clearfix"></div>').before(tab_list);

      // Transform each fieldset into a tab.
      $fieldsets.each(function () {
        var vertical_tab = new Backdrop.verticalTab({
          title: $('> legend', this).text(),
          fieldset: $(this),
        });
        tab_list.append(vertical_tab.item);
        $(this)
          .removeClass('collapsible collapsed')
          .addClass('vertical-tabs-pane')
          .data('verticalTab', vertical_tab);
        if (this.id == focusID) {
          tab_focus = $(this);
        }
      });

      $('> li:first', tab_list).addClass('first');
      $('> li:last', tab_list).addClass('last');

      if (!tab_focus) {
        // If the current URL has a fragment and one of the tabs contains an
        // element that matches the URL fragment, activate that tab.
        if (window.location.hash && $(this).find(window.location.hash).length) {
          tab_focus = $(this).find(window.location.hash).closest('.vertical-tabs-pane');
        }
        else {
          tab_focus = $fieldsets.first();
        }
      }
      if (tab_focus.length) {
        tab_focus.data('verticalTab').focus();
      }
    });
  }
};

/**
 * The vertical tab object represents a single tab within a tab group.
 *
 * @param settings
 *   An object with the following keys:
 *   - title: The name of the tab.
 *   - fieldset: The jQuery object of the fieldset that is the tab pane.
 */
Backdrop.verticalTab = function (settings) {
  var self = this;
  $.extend(this, settings, Backdrop.theme('verticalTab', settings));

  this.link.click(function () {
    self.focus();
    return false;
  });

  this.fieldset.children('legend').click(function () {
    self.focus();
    return false;
  });

  // Keyboard events added:
  // Pressing the Enter key will open the tab pane.
  this.link.keydown(function(event) {
    if (event.keyCode == 13) {
      self.focus();
      // Set focus on the first input field of the visible fieldset/tab pane.
      $("fieldset.vertical-tabs-pane :input:visible:enabled:first").focus();
      return false;
    }
  });

  // Add summary to legend which is seen on smaller breakpoints
  var $legend = this.fieldset.children('legend');
  $legend.append(this.legendSummary = $('<span class="summary"></span>'));
  $legend.addClass('vertical-tab-link');

  this.fieldset
    .bind('summaryUpdated', function () {
      self.updateSummary();
    })
    .trigger('summaryUpdated');
};

Backdrop.verticalTab.prototype = {
  /**
   * Displays the tab's content pane.
   */
  focus: function () {
    // Update tab control for desktop
    this.item.siblings('.vertical-tab-selected').removeClass('vertical-tab-selected');
    this.item
      .addClass('vertical-tab-selected')
      .siblings(':hidden.vertical-tabs-active-tab')
        .val(this.fieldset.attr('id'));
    // Update classes on previous active and new active pane
    this.fieldset.siblings('.vertical-tab-selected').removeClass('vertical-tab-selected');
    this.fieldset.addClass('vertical-tab-selected');
    // Mark the active tab for screen readers.
    $('#active-vertical-tab').remove();
    this.link.append('<span id="active-vertical-tab" class="element-invisible">' + Backdrop.t('(active tab)') + '</span>');
  },

  /**
   * Updates the tab's summary.
   */
  updateSummary: function () {
    var summaryText = this.fieldset.backdropGetSummary();
    this.summary.html(summaryText);
    this.legendSummary.html(summaryText);
  },

  /**
   * Shows a vertical tab pane.
   */
  tabShow: function () {
    // Show the tab.
    this.item.show();

    // Update .first marker for items. We need recurse from parent to retain the
    // actual DOM element order as jQuery implements sortOrder, but not as public
    // method.
    var $allTabs = this.item.parent().children('.vertical-tab-item');
    $allTabs.removeClass('first').filter(':visible:first').addClass('first');

    // Remove hidden class, in case tabHide was run on this tab.
    this.fieldset.removeClass('vertical-tab-hidden').show();

    // Focus this tab if it is the only one.
    if ($allTabs.length === 1) {
      $allTabs.first().data('verticalTab').focus();
    }

    return this;
  },

  /**
   * Hides a vertical tab pane.
   */
  tabHide: function () {
    // Hide the tab.
    this.item.hide();

    // Update .first marker for items. We need recurse from parent to retain the
    // actual DOM element order as jQuery implements sortOrder, but not as public
    // method.
    this.item.parent().children('.vertical-tab-item').removeClass('first')
      .filter(':visible:first').addClass('first');

    // Hide the fieldset.
    this.fieldset.addClass('vertical-tab-hidden').hide();

    // Focus the first visible tab (if there is one).
    var $firstTab = this.fieldset.siblings('.vertical-tabs-pane:not(.vertical-tab-hidden):first');
    if ($firstTab.length) {
      $firstTab.data('verticalTab').focus();
    }
    return this;
  }
};

/**
 * Theme function for a vertical tab.
 *
 * @param settings
 *   An object with the following keys:
 *   - title: The name of the tab.
 * @return
 *   This function has to return an object with at least these keys:
 *   - item: The root tab jQuery element
 *   - link: The anchor tag that acts as the clickable area of the tab
 *       (jQuery version)
 *   - summary: The jQuery element that contains the tab summary
 */
Backdrop.theme.prototype.verticalTab = function (settings) {
  var tab = {};
  // Calculating height in em so CSS has a chance to update height
  tab.item = $('<li class="vertical-tab-item" tabindex="-1"></li>')
    .append(tab.link = $('<a href="#" class="vertical-tab-link"></a>')
      .append(tab.title = $('<strong></strong>').text(settings.title))
      .append(tab.summary = $('<span class="summary"></span>')
    )
  );
  return tab;
};

})(jQuery);
