<?php
/**
 * @file
 * Theme functions for CKEditor module.
 */

/**
 * Preprocess variables for theme_ckeditor_settings_toolbar().
 */
function template_preprocess_ckeditor_settings_toolbar(&$variables) {
  // Simplify the language direction information for toolbar buttons.
  global $language;
  $variables['language_direction'] = isset($language->direction) && $language->direction === LANGUAGE_RTL ? 'rtl' : 'ltr';

  // Create lists of active and disabled buttons.
  $format = $variables['format'];
  $plugins = $variables['plugins'];
  $buttons = array();
  $multiple_buttons = array();
  foreach ($plugins as $plugin_info) {
    if (isset($plugin_info['buttons'])) {
      foreach ($plugin_info['buttons'] as $button_name => $button) {
        $button['name'] = $button_name;
        if (!empty($button['multiple'])) {
          $multiple_buttons[$button_name] = $button;
        }
        $buttons[$button_name] = $button;
      }
    }
  }
  $button_groups = array();
  $active_buttons = array();
  $settings = $format->editor_settings;
  foreach ($settings['toolbar'] as $row_number => $row) {
    $button_groups[$row_number] = array();
    foreach ($row as $group) {
      foreach ($group['items'] as $button_name) {
        if (isset($buttons[$button_name])) {
          // Save a reference to the button's configured toolbar group.
          $buttons[$button_name]['group'] = $group['name'];
          $active_buttons[$row_number][] = $buttons[$button_name];
          if (empty($buttons[$button_name]['multiple'])) {
            unset($buttons[$button_name]);
          }
          // Create a list of all the toolbar button groups.
          if (!in_array($group['name'], $button_groups[$row_number])) {
            array_push($button_groups[$row_number], $group['name']);
          }
        }
      }
    }
  }
  $disabled_buttons = array_diff_key($buttons, $multiple_buttons);

  $rtl = $variables['language_direction'] === 'rtl' ? '_rtl' : '';

  $build_button_item = function($button, $rtl) {
    // Value of the button item.
    if (isset($button['image_alternative' . $rtl])) {
      $value = filter_xss_admin($button['image_alternative' . $rtl]);
    }
    elseif (isset($button['image_alternative'])) {
      $value = filter_xss_admin($button['image_alternative']);
    }
    elseif (isset($button['image'])) {
      $value = '<img src="'. file_create_url($button['image' . $rtl]) . '" title="' . check_plain($button['label']) . '" />';
      $value = '<a href="#" role="button" title="' . $button['label'] . '" aria-label="' . $button['label'] . '"><span class="cke_button_icon">' . $value . '</span></a>';
    }
    else {
      $value = '?';
    }

    // Build the button attributes.
    $attributes = array(
      'data-button-name' => $button['name'],
      'class' => array('ckeditor-button'),
    );
    if (!empty($button['attributes'])) {
      $attributes = backdrop_array_merge_deep($attributes, $button['attributes']);
    }
    if (!empty($button['required_html'])) {
      $attributes['data-required-html'] = backdrop_json_encode($button['required_html']);
    }
    if (!empty($button['optional_html'])) {
      $attributes['data-optional-html'] = backdrop_json_encode($button['optional_html']);
    }

    // Build the button item.
    $button_item = array(
      'contents' => $value,
      'attributes' => $attributes,
    );
    // If this button has group information, add it to the attributes.
    if (!empty($button['group'])) {
      $button_item['group'] = $button['group'];
    }

    // Set additional flag on the button if it can occur multiple times.
    if (!empty($button['multiple'])) {
      $button_item['multiple'] = TRUE;
    }

    return $button_item;
  };

  // Assemble list of disabled buttons (which are always a single row).
  $variables['active_buttons'] = array();
  foreach ($active_buttons as $row_number => $button_row) {
    foreach ($button_groups[$row_number] as $group_name) {
      $variables['active_buttons'][$row_number][$group_name] = array(
        'group_name_class' => backdrop_clean_css_identifier($group_name),
        'buttons' => array(),
      );
      $buttons = array_filter($button_row, function ($button) use ($group_name) {
        return $button['group'] === $group_name;
      });
      foreach ($buttons as $button) {
        $variables['active_buttons'][$row_number][$group_name]['buttons'][] = $build_button_item($button, $rtl);
      }
    }
  }
  // Assemble list of disabled buttons (which are always a single row).
  $variables['disabled_buttons'] = array();
  foreach ($disabled_buttons as $button) {
    $variables['disabled_buttons'][] = $build_button_item($button, $rtl);
  }
  // Assemble list of multiple buttons that may be added multiple times.
  $variables['multiple_buttons'] = array();
  foreach ($multiple_buttons as $button) {
    $variables['multiple_buttons'][] = $build_button_item($button, $rtl);
  }
}

/**
 * Displays the toolbar configuration for CKEditor.
 */
function theme_ckeditor_settings_toolbar($variables) {
  $add_group = '<span class="ckeditor-group-add-wrapper"><a href="#" class="ckeditor-group-add">' . t('Add group') . '</a></span>';

  $row_controls = '';
  $row_controls .= '<span class="ckeditor-row-controls">';
  $row_controls .= '<a href="#" class="ckeditor-row-remove" title="' . t('Remove row') . '">-</a>';
  $row_controls .= '<a href="#" class="ckeditor-row-add" title="' . t('Add row') . '">+</a>';
  $row_controls .= '</span>';

  // We don't use theme_item_list() below in case there are no buttons in the
  // active or disabled list, as theme_item_list() will not print an empty UL.
  $output = '';
  $output .= '<strong>' . t('Active toolbar') . '</strong>';
  $output .= '<div class="ckeditor-toolbar-active clearfix">';
  $output .= '<ul class="ckeditor-active-toolbar-configuration">';
  foreach ($variables['active_buttons'] as $button_row) {
    $output .= '<li class="ckeditor-row">';
    $output .= '<ul class="ckeditor-toolbar-groups">';
    foreach ($button_row as $button_group_name => $button_group) {
      $output .= '<li class="ckeditor-toolbar-group" data-group-name="' . check_plain($button_group_name) . '">';
      $output .= '<h3 class="ckeditor-toolbar-group-name">' . check_plain($button_group_name) . '</h3>';
      $output .= '<ul class="ckeditor-buttons ckeditor-toolbar-group-buttons">';
      foreach ($button_group['buttons'] as $button) {
        $contents = $button['contents'];
        $attributes = backdrop_attributes($button['attributes']);
        $output .= '<li' . $attributes . '>' . $contents . '</li>';
      }
      $output .= '</ul>';
    }
    $output .= '</ul>';
    $output .= $add_group;
    $output .= $row_controls;
    $output .= '</li>';
  }
  if (empty($variables['active_buttons'])) {
    $output .= '<li class="ckeditor-row">';
    $output .= '<ul class="ckeditor-toolbar-groups">';
    $output .= '<li class="ckeditor-toolbar-group" data-group-name="' . check_plain($button_group_name) . '">';
    $output .= '<h3 class="ckeditor-toolbar-group-name">' . check_plain($button_group_name) . '</h3>';
    $output .= '<ul class="ckeditor-buttons ckeditor-toolbar-group-buttons">';
    $output .= '</ul>';
    $output .= '</li>';
    $output .= '</ul>';
    $output .= $add_group;
    $output .= $row_controls;
    $output .= '</li>';
  }
  $output .= '</ul>';

  $output .= '</div>';

  $output .= '<strong>' . t('Available buttons') . '</strong>';
  $output .= '<div class="ckeditor-toolbar-disabled clearfix">';
  $output .= '<ul class="ckeditor-buttons">';
  foreach ($variables['disabled_buttons'] as $button) {
    $contents = $button['contents'];
    $attributes = backdrop_attributes($button['attributes']);
    $output .= '<li' . $attributes . '>' . $contents . '</li>';
  }
  $output .= '</ul>';
  $output .= '<ul class="ckeditor-multiple-buttons">';
  foreach ($variables['multiple_buttons'] as $button) {
    $contents = $button['contents'];
    $attributes = backdrop_attributes($button['attributes']);
    $output .= '<li' . $attributes . '>' . $contents . '</li>';
  }
  $output .= '</ul>';
  $output .= '</div>';

  // Wrap the whole thing in a fieldset.
  $fieldset = array(
    '#type' => 'fieldset',
    '#children' => $output,
    '#title' => t('CKEditor Toolbar'),
  );

  return backdrop_render($fieldset);
}
