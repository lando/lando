<?php
/**
 * @file
 * Contains a theme's functions to manipulate or override the default markup.
 */

/**
 * Prepares variables for maintenance page templates.
 *
 * @see maintenance_page.tpl.php
 */
function bartik_preprocess_maintenance_page(&$variables) {
  backdrop_add_css(backdrop_get_path('theme', 'bartik') . '/css/maintenance-page.css');
}

/**
 * Prepares variables for page templates.
 *
 * @see page.tpl.php
 */
function bartik_css_alter(&$css) {
  // If using the legacy "Blue lagoon" color scheme, load the legacy stylesheet.
  $theme_path = backdrop_get_path('theme', 'bartik');
  if (theme_get_setting('color_legacy') && isset($css[$theme_path . '/css/colors.css'])) {
    $css[$theme_path . '/css/colors.css']['data'] = $theme_path . '/css/colors-legacy.css';
  }
}

/**
 * Prepares variables for layout template files.
 *
 * @see layout.tpl.php
 */
function bartik_preprocess_layout(&$variables) {
  if ($variables['content']['header']) {
    $extra_header_classes = array();
    $extra_header_classes[] = theme_get_setting('main_menu_tabs');
    $legacy = array('one_column', 'two_column', 'two_column_flipped', 'three_three_four_column');
    if (in_array($variables['layout']->layout_template, $legacy)) {
      $extra_header_classes[] = 'l-header-inner';
    }
    $variables['content']['header'] = '<div class="' . implode(' ', $extra_header_classes) . '">' . $variables['content']['header'] . '</div>';
  }
}

/**
 * Overrides theme_field__FIELD_TYPE().
 */
function bartik_field__taxonomy_term_reference($variables) {
  $output = '';

  // Render the label, if it's not hidden.
  if (!$variables['label_hidden']) {
    $output .= '<h3 class="field-label">' . $variables['label'] . ': </h3>';
  }

  // Render the items.
  $output .= ($variables['element']['#label_display'] == 'inline') ? '<ul class="links inline">' : '<ul class="links">';
  foreach ($variables['items'] as $delta => $item) {
    $item_attributes = (isset($variables['item_attributes'][$delta])) ? backdrop_attributes($variables['item_attributes'][$delta]) : '';
    $output .= '<li class="taxonomy-term-reference-' . $delta . '"' . $item_attributes . '>' . backdrop_render($item) . '</li>';
  }
  $output .= '</ul>';

  // Render the surrounding DIV with appropriate classes and attributes.
  if (!in_array('clearfix', $variables['classes'])) {
    $variables['classes'][] = 'clearfix';
  }
  $output = '<div class="' . implode(' ', $variables['classes']) . '"' . backdrop_attributes($variables['attributes']) . '>' . $output . '</div>';

  return $output;
}
