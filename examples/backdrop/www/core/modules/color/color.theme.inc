<?php
/**
 * @file
 * Theme functions for the Color module.
 */

/**
 * Returns HTML for a theme's color form.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_color_scheme_form($variables) {
  $form = $variables['form'];

  $theme = $form['theme']['#value'];
  $info = $form['info']['#value'];
  $path = backdrop_get_path('theme', $theme) . '/';
  backdrop_add_css($path . $info['preview_css']);

  $preview_js_path = isset($info['preview_js']) ? $path . $info['preview_js'] : backdrop_get_path('module', 'color') . '/js/color.preview.js';
  // Add the JS at a weight below color.js.
  backdrop_add_js($preview_js_path, array('weight' => -1));

  $output  = '';
  $output .= '<div class="color-form clearfix">';
  $output .= '<div id="palette" class="clearfix">';
  // Color schemes
  $output .= backdrop_render($form['scheme']);
  // Palette
  foreach (element_children($form['palette']) as $name) {
    $output .= backdrop_render($form['palette'][$name]);
  }
  $output .= '</div>';
  // Preview
  $output .= backdrop_render_children($form);
  $output .= '<div class="color-preview">';
  $output .= '<h2>' . t('Preview') . '</h2>';
  // Attempt to load preview HTML if the theme provides it.
  $preview_html_path = BACKDROP_ROOT . '/' . (isset($info['preview_html']) ? backdrop_get_path('theme', $theme) . '/' . $info['preview_html'] : backdrop_get_path('module', 'color') . '/preview.html');
  $output .= file_get_contents($preview_html_path);
  // Close the wrapper divs.
  $output .= '</div>';
  $output .= '</div>';

  return $output;
}

