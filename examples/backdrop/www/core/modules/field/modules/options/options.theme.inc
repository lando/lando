<?php
/**
 * @file
 * Theme functions for the Options module.
 */

/**
 * Returns HTML for the label for the empty value for options that are not required.
 *
 * The default theme will display N/A for a radio list and '- None -' for a select.
 *
 * @param $variables
 *   An associative array containing:
 *   - instance: An array representing the widget requesting the options.
 *
 * @ingroup themeable
 */
function theme_options_none($variables) {
  $instance = $variables['instance'];
  $option = $variables['option'];

  $output = '';
  switch ($instance['widget']['type']) {
    case 'options_buttons':
      $output = t('N/A');
      break;

    case 'options_select':
      $output = ($option == 'option_none' ? t('- None -') : t('- Select a value -'));
      break;
  }

  return $output;
}

