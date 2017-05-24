<?php
/**
 * @file
 * Contains support for legacy Bartik Blue Lagoon colors.
 *
 * @todo Remove in Backdrop 2.0
 */

/**
 * Alters the theme settings form for Bartik legacy colors.
 *
 * This is specifically for sites upgrading from an older installation that had
 * the "Blue Lagoon" default color scheme. Because themes are not permitted
 * to alter forms or add submit handlers, this code resides in Color module.
 *
 * @see color_form_system_theme_settings_alter().
 * @deprecated since 1.3.0
 */
function bartik_form_system_theme_settings_alter(&$form, &$form_state) {
  if (theme_get_setting('color_legacy', 'bartik')) {
    $form['color']['scheme']['#default_value'] = 'blue_lagoon';
    $palette = $form['color']['info']['#value']['schemes']['blue_lagoon']['colors'];
    foreach ($palette as $key => $color) {
      $form['color']['palette'][$key]['#default_value'] = $color;
    }
  }

  // Add a new submit handler.
  array_unshift($form['#submit'], 'bartik_form_system_theme_settings_alter_submit');
}

/**
 * Submit handler for theme settings form.
 *
 * @deprecated since 1.3.0
 */
function bartik_form_system_theme_settings_alter_submit($form, &$form_state) {
  // If still using the legacy palette, don't save a custom color scheme.
  $legacy_palette = $form['color']['info']['#value']['schemes']['blue_lagoon']['colors'];
  if ($legacy_palette == $form_state['values']['palette']) {
    // Removing "info" will prevent Color module from making a new stylesheet.
    unset($form_state['values']['info']);
    unset($form_state['values']['scheme']);
    unset($form_state['values']['palette']);
    // Set the legacy flag in the bartik.settings config file.
    $form_state['values']['color_legacy'] = TRUE;
  }
  else {
    $form_state['values']['color_legacy'] = FALSE;
  }
}
