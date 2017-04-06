(function ($, Backdrop) {

"use strict";

Backdrop.behaviors.ckeditorAdmin = {
  attach: function (context, settings) {
    var $context = $(context);
    $context.find('.ckeditor-toolbar-configuration').once('ckeditor-toolbar', function() {
      var $wrapper = $(this);
      var $textareaWrapper = $(this).find('.form-item-editor-settings-toolbar').hide();
      var $textarea = $textareaWrapper.find('textarea');
      var $toolbarAdmin = $(settings.ckeditor.toolbarAdmin);
      var sortableSettings = {
        connectWith: '.ckeditor-buttons',
        placeholder: 'ckeditor-button-placeholder',
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        cursor: 'move',
        stop: adminToolbarStopDrag
      };
      var groupSortableSettings = {
        connectWith: '.ckeditor-toolbar-groups',
        cursor: 'move',
        tolerance: 'touch',
        stop: adminToolbarStopDrag
      };
      $toolbarAdmin.insertAfter($textareaWrapper);

      // Remove the invalid buttons after a delay to allow all behaviors to
      // finish attaching.
      window.setTimeout(function() {
        adminToolbarRemoveInvalidButtons();
        adminToolbarInitializeButtons();
      }, 10);

      // Add draggable/sortable behaviors.
      $toolbarAdmin.find('.ckeditor-buttons').sortable(sortableSettings);
      $toolbarAdmin.find('.ckeditor-toolbar-groups').sortable(groupSortableSettings);
      $toolbarAdmin.find('.ckeditor-multiple-buttons li').draggable({
        connectToSortable: '.ckeditor-toolbar-active .ckeditor-buttons',
        helper: 'clone'
      });

      // Add the show/hide groups link.
      var $activeToolbar = $toolbarAdmin.parent().find('.ckeditor-toolbar-active');
      var $toolbarGroupToggle = $(Backdrop.theme('ckeditorButtonGroupNamesToggle'));
      $toolbarGroupToggle.shown = true;
      $toolbarGroupToggle.text(Backdrop.t('Show group labels'));
      $toolbarGroupToggle.insertBefore($activeToolbar);
      $toolbarGroupToggle.bind('click.ckeditorToogleGroups', function(event) {
        adminToolbarToggleGroups.apply(event.target, [$toolbarGroupToggle]);
      });

      // Disable clicking on the individual buttons.
      $toolbarAdmin.find('.ckeditor-button a').click(function(event) {
        return false;
      });

      // Add the handler for modifying group names.
      $toolbarAdmin.bind('click.ckeditorRenameGroup', function(event) {
        if ($(event.target).is('.ckeditor-toolbar-group-name')) {
          adminToolbarRenameGroup.apply(event.target, [event]);
        }
      });

      // Add the handler for adding a new group.
      $toolbarAdmin.bind('click.ckeditorAddGroup', function(event) {
        if ($(event.target).is('a.ckeditor-group-add')) {
          adminToolbarAddGroup.apply(event.target, [event]);
        }
      });

      // Add the handler for adding/removing row buttons.
      $toolbarAdmin.bind('click.ckeditorAddRow', function(event) {
        if ($(event.target).is('a.ckeditor-row-add')) {
          adminToolbarAddRow.apply(event.target, [event]);
        }
      });
      $toolbarAdmin.bind('click.ckeditorAddRow', function(event) {
        if ($(event.target).is('a.ckeditor-row-remove')) {
          adminToolbarRemoveRow.apply(event.target, [event]);
        }
      });
      $toolbarAdmin.find('a.ckeditor-row-remove:first').hide();

      /**
       * Show/hide the toolbar group labels.
       */
      function adminToolbarToggleGroups($toolbarGroupToggle) {
        if ($toolbarGroupToggle.shown) {
          $toolbarGroupToggle.shown = false;
          $toolbarGroupToggle.text(Backdrop.t('Hide group labels'));
          $activeToolbar.addClass('ckeditor-group-names-are-visible');
        }
        else {
          $toolbarGroupToggle.shown = true;
          $toolbarGroupToggle.text(Backdrop.t('Show group labels'));
          $activeToolbar.removeClass('ckeditor-group-names-are-visible');
        }
      }

      /**
       * Rename a group.
       */
      function adminToolbarRenameGroup(event) {
        var $label = $(this);
        var $group = $label.closest('.ckeditor-toolbar-group');
        var currentText = $label.text();
        var newText = window.prompt(Backdrop.t('Enter a label for this group. This will be used by screenreaders and other accessibility software.'), currentText);
        if (newText) {
          $label.text(newText);
          $group.data('groupName', newText).attr('data-group-name', newText);
          adminToolbarUpdateValue();
        }
        // Remove the entire group if the label and contents are empty.
        else if ($group.find('.ckeditor-button').length === 0) {
          $group.remove();
          adminToolbarUpdateValue();
        }
      }

      /**
       * Add a new group of buttons to the current row.
       */
      function adminToolbarAddGroup(event) {
        var $groups = $(this).closest('.ckeditor-row').find('.ckeditor-toolbar-groups');
        var $group;
        var newText = window.prompt(Backdrop.t('Enter a label for this group. This will be used by screenreaders and other accessibility software.'));
        if (newText) {
          $group = $(Backdrop.theme('ckeditorButtonGroup'));
          $group.find('.ckeditor-toolbar-group-name').text(newText);
          $group.data('group-name', newText);
          $groups.append($group);
          $groups.find('.ckeditor-buttons').sortable(sortableSettings);
          $groups.sortable(groupSortableSettings);
        }
        event.preventDefault();
      }

      /**
       * Add a new row of buttons.
       */
      function adminToolbarAddRow(event) {
        var $rows = $(this).closest('.ckeditor-toolbar-active').find('.ckeditor-row');
        var $newRow = $rows.last().clone();
        $newRow.find('.ckeditor-toolbar-groups').empty();
        $newRow.insertAfter($rows.last());
        $newRow.find('.ckeditor-buttons').sortable(sortableSettings);
        $newRow.find('.ckeditor-toolbar-groups').sortable(groupSortableSettings);
        $newRow.find('.ckeditor-row-controls a').show();
        redrawToolbarGradient();
        event.preventDefault();
      }

      /**
       * Remove a row of buttons.
       */
      function adminToolbarRemoveRow(event) {
        var $rows = $(this).closest('.ckeditor-toolbar-active').find('.ckeditor-row');
        if ($rows.length === 1) {
          $(this).hide();
        }
        if ($rows.length > 1) {
          var $lastRow = $rows.last();
          var $disabledButtons = $wrapper.find('.ckeditor-toolbar-disabled .ckeditor-buttons');
          var $buttonsToDisable = $lastRow.find().children(':not(.ckeditor-multiple-button)');
          $buttonsToDisable.prependTo($disabledButtons);
          $buttonsToDisable.each(function(n) {
            adminToolbarButtonMoved($buttonsToDisable.eq(n));
          });
          $lastRow.find('.ckeditor-buttons').sortable('destroy');
          $lastRow.find('.ckeditor-toolbar-groups').sortable('destroy');
          $lastRow.remove();
          redrawToolbarGradient();
          adminToolbarUpdateValue();
        }
        event.preventDefault();
      }

      /**
       * Browser quirk work-around to redraw CSS3 gradients.
       */
      function redrawToolbarGradient() {
        $wrapper.find('.ckeditor-toolbar-active').css('position', 'relative');
        window.setTimeout(function() {
          $wrapper.find('.ckeditor-toolbar-active').css('position', '');
        }, 10);
      }

      /**
       * jQuery Sortable stop event. Save updated toolbar positions to the textarea.
       */
      function adminToolbarStopDrag(event, ui) {
        var $element = ui.item;
        // Remove separators when dragged out.
        if ($element.is('.ckeditor-button-separator') && $element.closest('.ckeditor-active-toolbar-configuration').length === 0) {
          $element.remove();
        }
        // Notify the filter system of updated or removed features.
        adminToolbarButtonMoved($element);
        adminToolbarUpdateValue();
      }

      /**
       * Notify the filter system of any button changes.
       */
      function adminToolbarButtonMoved($element) {
        var buttonFeature = adminToolbarButtonCreateFeature($element);
        var buttonAdded = $element.closest('.ckeditor-active-toolbar-configuration').length !== 0;
        if (buttonFeature) {
          if (buttonAdded) {
            Backdrop.editorConfiguration.addedFeature(buttonFeature);
          }
          else {
            Backdrop.editorConfiguration.removedFeature(buttonFeature);
          }
        }
      }

      /**
       * Create a Backdrop.EditorFeatureHTMLRule instance based on a button DOM element.
       */
      function adminToolbarButtonCreateFeature($element) {
        var requiredHtml = $element.data('required-html');
        var optionalHtml = $element.data('optional-html');
        var buttonName = $element.data('button-name');
        var buttonFeature, buttonRule, buttonRuleDefinition;
        if (buttonName) {
          buttonFeature = new Backdrop.EditorFeature(buttonName);
          if (requiredHtml) {
            for (var n = 0; n < requiredHtml.length; n++) {
              buttonRuleDefinition = requiredHtml[n];
              buttonRuleDefinition.required = true;

              // If there are any styles or classes, that means that an
              // attribute for "style" or "class" must be added.
              buttonRuleDefinition.attributes = buttonRuleDefinition.attributes || [];
              if (buttonRuleDefinition.styles && buttonRuleDefinition.styles.length) {
                buttonRuleDefinition.attributes.push('style');
              }
              if (buttonRuleDefinition.classes && buttonRuleDefinition.classes.length) {
                buttonRuleDefinition.attributes.push('class');
              }
              buttonRule = new Backdrop.EditorFeatureHTMLRule(buttonRuleDefinition);
              buttonFeature.addHTMLRule(buttonRule);
            }
          }
          if (optionalHtml) {
            for (var n = 0; n < optionalHtml.length; n++) {
              buttonRuleDefinition = optionalHtml[n];
              buttonRuleDefinition.required = false;
              buttonRule = new Backdrop.EditorFeatureHTMLRule(buttonRuleDefinition);
              buttonFeature.addHTMLRule(buttonRule);
            }
          }
        }
        else {
          buttonFeature = false;
        }

        return buttonFeature;
      }

      /**
       * Update the toolbar value textarea.
       */
      function adminToolbarUpdateValue() {
        // Update the toolbar config after updating a sortable.
        var toolbarConfig = [];
        var $group, rowGroups, groupButtons;
        $wrapper.find('.ckeditor-row').each(function() {
          rowGroups = [];
          $(this).find('.ckeditor-toolbar-group').each(function() {
            $group = $(this);
            groupButtons = [];
            $group.find('.ckeditor-button').each(function() {
              groupButtons.push($(this).data('button-name'));
            });
            rowGroups.push({
              name: $group.data('group-name'),
              items: groupButtons
            });
          });
          toolbarConfig.push(rowGroups);
        });
        $textarea.val(JSON.stringify(toolbarConfig));
      }

      /**
       * Remove a single button from the toolbar.
       */
      function adminToolbarRemoveButton($button, feature) {
        var $buttonGroup = $button.closest('.ckeditor-toolbar-group-buttons');
        $button.remove();

        // Remove the entire group if this is the last button.
        if ($buttonGroup.children().length === 0) {
          $buttonGroup.closest('.ckeditor-toolbar-group').remove();
        }

        // Put the button back into the disabled list if it's not a separator.
        if ($button.is('.ckeditor-button')) {
          $wrapper.find('.ckeditor-toolbar-disabled .ckeditor-buttons').prepend($button);
        }

        // Fire event indicating this button/feature was removed.
        Backdrop.editorConfiguration.removedFeature(feature);
      }

      /**
       * Notify the editor system of the initial button state.
       */
      function adminToolbarInitButton($button, feature, enabled) {
        // Fire event indicating this button's initial status.
        Backdrop.editorConfiguration.initFeature(feature, enabled);
      }

      /**
       * Ensure the configuration of the toolbar is allowed by the filters.
       */
      function adminToolbarRemoveInvalidButtons() {
        var rules = Backdrop.filterConfiguration.getCombinedFilterRules();
        $wrapper.find('.ckeditor-toolbar-active .ckeditor-button').each(function () {
          var $button = $(this);
          var feature = adminToolbarButtonCreateFeature($button);
          if (feature && !Backdrop.editorConfiguration.featureIsAllowed(feature, rules)) {
            adminToolbarRemoveButton($button, feature);
          }
        });
      }

      /**
       * Notify listeners to the initial state of the buttons/features.
       */
      function adminToolbarInitializeButtons() {
        $wrapper.find('.ckeditor-toolbar-active .ckeditor-button').each(function () {
          var $button = $(this);
          var feature = adminToolbarButtonCreateFeature($button);
          adminToolbarInitButton($button, feature, true);
        });
        $wrapper.find('.ckeditor-toolbar-disabled .ckeditor-button').each(function() {
          var $button = $(this);
          var feature = adminToolbarButtonCreateFeature($button);
          adminToolbarInitButton($button, feature, false);
        });
      }
    });
  }
};

/**
 * Respond to the events of the editor system. 
 *
 * This handles hiding/showing options based on the enabling, disabling, and
 * initial state of buttons.
 */
Backdrop.behaviors.ckeditorAdminToggle = {
  'attach': function(context, settings) {
    var ckeditorAdminToggleDependency = function(featureName, enabled) {
      $('[data-ckeditor-feature-dependency]').each(function() {
        var $element = $(this);
        var dependency = $element.data('ckeditor-feature-dependency');
        if (dependency === featureName) {
          if (enabled) {
            $element.show();
          }
          else {
            $element.hide();
          }
        }
      });
    };

    $(context).find('#filter-admin-format-form').once('ckeditor-settings-toggle', function() {
      $(this).find('[data-ckeditor-feature-dependency]').hide();
      $(document).on('backdropEditorFeatureInit.ckeditorAdminToggle', function(e, feature, enabled) {
        ckeditorAdminToggleDependency(feature.name, enabled);
      });
      $(document).on('backdropEditorFeatureAdded.ckeditorAdminToggle', function(e, feature) {
        ckeditorAdminToggleDependency(feature.name, true);
      });
      $(document).on('backdropEditorFeatureRemoved.ckeditorAdminToggle', function(e, feature) {
        ckeditorAdminToggleDependency(feature.name, false);
      });
    });
  },
  'detach': function(context, settings) {
    $(context).find('#filter-admin-format-form').each(function() {
      $(document).off('.ckeditorAdminToggle');
    });
  }
};

/**
 * Themes the contents of an empty button group.
 */
Backdrop.theme.prototype.ckeditorButtonGroup = function () {
  // This may look odd but we indeed need an <li> wrapping an empty <ul>.
  return '<li class="ckeditor-toolbar-group"><h3 class="ckeditor-toolbar-group-name"></h3><ul class="ckeditor-buttons ckeditor-toolbar-group-buttons"></ul></li>';
};

/**
 * Themes a button that will toggle the button group names in active config.
 */
Backdrop.theme.prototype.ckeditorButtonGroupNamesToggle = function () {
  return '<a class="ckeditor-groupnames-toggle" role="button" aria-pressed="false"></a>';
};

})(jQuery, Backdrop);
