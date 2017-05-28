<?php
/**
 * @file
 * Theme functions for the Field module.
 */

/**
 * Returns HTML for a field.
 *
 * This is the default theme implementation to display the value of a field.
 * Theme developers who are comfortable with overriding theme functions may do
 * so in order to customize this markup. This function can be overridden with
 * varying levels of specificity. For example, for a field named 'body'
 * displayed on the 'post' content type, any of the following functions will
 * override this default implementation. The first of these functions that
 * exists is used:
 * - THEMENAME_field__body__post()
 * - THEMENAME_field__post()
 * - THEMENAME_field__body()
 * - THEMENAME_field()
 *
 * Theme developers who prefer to customize templates instead of overriding
 * functions may copy the "field.tpl.php" from the "modules/field/theme" folder
 * of the Backdrop installation to somewhere within the theme's folder and
 * customize it, just like customizing other Backdrop templates such as
 * page.tpl.php or node.tpl.php. However, it takes longer for the server to
 * process templates than to call a function, so for websites with many fields
 * displayed on a page, this can result in a noticeable slowdown of the website.
 * For these websites, developers are discouraged from placing a field.tpl.php
 * file into the theme's folder, but may customize templates for specific
 * fields. For example, for a field named 'body' displayed on the 'post'
 * content type, any of the following templates will override this default
 * implementation. The first of these templates that exists is used:
 * - field--body--post.tpl.php
 * - field--post.tpl.php
 * - field--body.tpl.php
 * - field.tpl.php
 * So, if the body field on the post content type needs customization, a
 * field--body--post.tpl.php file can be added within the theme's folder.
 * Because it's a template, it will result in slightly more time needed to
 * display that field, but it will not impact other fields, and therefore,
 * is unlikely to cause a noticeable change in website performance. A very rough
 * guideline is that if a page is being displayed with more than 100 fields and
 * they are all themed with a template instead of a function, it can add up to
 * 5% to the time it takes to display that page. This is a guideline only and
 * the exact performance impact depends on the server configuration and the
 * details of the website.
 *
 * @param $variables
 *   An associative array containing:
 *   - label_hidden: A boolean indicating to show or hide the field label.
 *   - label: The label for the field.
 *   - content_attributes: An array of additional HTML attributes for the
 *     content's wrapper div.
 *   - items: An array of field items.
 *   - item_attributes: An array of additional HTML attributes for each item.
 *   - classes: Array containing the classes for the wrapping div.
 *
 * @see template_preprocess_field()
 * @see field.tpl.php
 *
 * @ingroup themeable
 */
function theme_field($variables) {
  $output = '';

  // Render the label, if it's not hidden.
  if (!$variables['label_hidden']) {
    $output .= '<div class="field-label">' . $variables['label'] . ':&nbsp;</div>';
  }

  // Render the items.
  $content_attributes = (isset($variables['content_attributes'])) ? backdrop_attributes($variables['content_attributes']) : '';
  $output .= '<div class="field-items"' . $content_attributes . '>';
  foreach ($variables['items'] as $delta => $item) {
    $classes = 'field-item ' . ($delta % 2 ? 'odd' : 'even');
    $item_attributes = (isset($variables['item_attributes'][$delta])) ? backdrop_attributes($variables['item_attributes'][$delta]) : '';
    $output .= '<div class="' . $classes . '"' . $item_attributes . '>' . backdrop_render($item) . '</div>';
  }
  $output .= '</div>';

  // Render the top-level DIV.
  $output = '<div class="' . implode(' ', $variables['classes']) . '"' . backdrop_attributes($variables['attributes']) . '>' . $output . '</div>';

  return $output;
}

/**
 * Returns HTML for an individual form element.
 *
 * Combine multiple values into a table with drag-n-drop reordering.
 * TODO : convert to a template.
 *
 * @param $variables
 *   An associative array containing:
 *   - element: A render element representing the form element.
 *
 * @ingroup themeable
 */
function theme_field_multiple_value_form($variables) {
  $element = $variables['element'];
  $output = '';

  if ($element['#cardinality'] > 1 || $element['#cardinality'] == FIELD_CARDINALITY_UNLIMITED) {
    $table_id = backdrop_html_id($element['#field_name'] . '_values');
    $order_class = $element['#field_name'] . '-delta-order';
    $required = !empty($element['#required']) ? theme('form_required_marker', $variables) : '';

    $header = array(
      array(
        'data' => '<label>' . t('!title !required', array('!title' => $element['#title'], '!required' => $required)) . "</label>",
        'colspan' => 2,
        'class' => array('field-label'),
      ),
      t('Order'),
    );
    $rows = array();

    // Sort items according to '_weight' (needed when the form comes back after
    // preview or failed validation)
    $items = array();
    foreach (element_children($element) as $key) {
      if ($key === 'add_more') {
        $add_more_button = &$element[$key];
      }
      else {
        $items[] = &$element[$key];
      }
    }
    usort($items, '_field_sort_items_value_helper');

    // Add the items as table rows.
    foreach ($items as $key => $item) {
      $item['_weight']['#attributes']['class'] = array($order_class);
      $delta_element = backdrop_render($item['_weight']);
      $cells = array(
        array('data' => '', 'class' => array('field-multiple-drag')),
        backdrop_render($item),
        array('data' => $delta_element, 'class' => array('delta-order')),
      );
      $rows[] = array(
        'data' => $cells,
        'class' => array('draggable'),
      );
    }

    $output = '<div class="form-item">';
    $output .= theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => $table_id, 'class' => array('field-multiple-table'))));
    $output .= $element['#description'] ? '<div class="description">' . $element['#description'] . '</div>' : '';
    $output .= '<div class="clearfix">' . backdrop_render($add_more_button) . '</div>';
    $output .= '</div>';

    backdrop_add_tabledrag($table_id, 'order', 'sibling', $order_class);
  }
  else {
    foreach (element_children($element) as $key) {
      $output .= backdrop_render($element[$key]);
    }
  }

  return $output;
}

/**
 * Theme preprocess function for theme_field() and field.tpl.php.
 *
 * @see theme_field()
 * @see field.tpl.php
 */
function template_preprocess_field(&$variables, $hook) {
  $element = $variables['element'];
  $variables['attributes'] = array();
  $variables['content_attributes'] = array();
  $variables['item_attributes'] = array();

  // There's some overhead in calling check_plain() so only call it if the label
  // variable is being displayed. Otherwise, set it to NULL to avoid PHP
  // warnings if a theme implementation accesses the variable even when it's
  // supposed to be hidden. If a theme implementation needs to print a hidden
  // label, it needs to supply a preprocess function that sets it to the
  // sanitized element title or whatever else is wanted in its place.
  $variables['label_hidden'] = ($element['#label_display'] == 'hidden');
  $variables['label'] = $variables['label_hidden'] ? NULL : check_plain($element['#title']);

  // We want other preprocess functions and the theme implementation to have
  // fast access to the field item render arrays. The item render array keys
  // (deltas) should always be a subset of the keys in #items, and looping on
  // those keys is faster than calling element_children() or looping on all keys
  // within $element, since that requires traversal of all element properties.
  $variables['items'] = array();
  foreach ($element['#items'] as $delta => $item) {
    if (!empty($element[$delta])) {
      $variables['items'][$delta] = $element[$delta];
      $variables['item_attributes'][$delta] = array();
    }
  }

  // Add default CSS classes. Since there can be many fields rendered on a page,
  // save some overhead by calling strtr() directly instead of
  // backdrop_html_class().
  $variables['field_name_css'] = strtr($element['#field_name'], '_', '-');
  $variables['field_type_css'] = strtr($element['#field_type'], '_', '-');
  $variables['classes'] = array(
    'field',
    'field-name-' . $variables['field_name_css'],
    'field-type-' . $variables['field_type_css'],
    'field-label-' . $element['#label_display'],
  );
  // Add a "clearfix" class to the wrapper since we float the label and the
  // field items in field.css if the label is inline.
  if ($element['#label_display'] == 'inline') {
    $variables['classes'][] = 'clearfix';
  }

  // Add specific suggestions that can override the default implementation.
  $variables['theme_hook_suggestions'] = array(
    'field__' . $element['#field_type'],
    'field__' . $element['#field_name'],
    'field__' . $element['#bundle'],
    'field__' . $element['#field_name'] . '__' . $element['#bundle'],
  );
}

