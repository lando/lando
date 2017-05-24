<?php
/**
 * @file
 * Theme functions for the Language module.
 */

/**
 * Returns HTML for the language overview form.
 *
 * @param $variables
 *   An associative array containing:
 *   - form: A render element representing the form.
 *
 * @ingroup themeable
 */
function theme_language_admin_overview_form_table($variables) {
  $form = $variables['form'];

  $rows = array();
  foreach (element_children($form, TRUE) as $langcode) {
    $element = &$form[$langcode];
    $row = array(
      'class' => array('draggable'),
    );
    foreach (element_children($element, TRUE) as $column) {
      $cell = &$element[$column];
      $row['data'][] = backdrop_render($cell);
    }
    $rows[] = $row;
  }

  $output = theme('table', array(
    'header' => $form['#header'],
    'rows' => $rows,
    'attributes' => array('id' => 'language-order'),
  ));
  $output .= backdrop_render_children($form);

  backdrop_add_tabledrag('language-order', 'order', 'sibling', 'language-order-weight');

  return $output;
}

