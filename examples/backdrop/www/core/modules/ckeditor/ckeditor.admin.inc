<?php
/**
 * Admin menu callbacks and theme functions for CKEditor module.
 */

/**
 * Editor settings callback; Provide options for CKEditor module.
 */
function ckeditor_settings_form(&$form, $form_state, $format) {
  $plugins = ckeditor_plugins();
  $toolbar_element = theme('ckeditor_settings_toolbar', array('format' => $format, 'plugins' => $plugins));
  $elements = array(
    '#attached' => array(
      'library' => array(
        array('ckeditor', 'backdrop.ckeditor.admin'),
      ),
      'js' => array(
        array('data' => array('ckeditor' => array('toolbarAdmin' => $toolbar_element)), 'type' => 'setting')
      ),
    ),
    '#attributes' => array('class' => array('ckeditor-toolbar-configuration')),
  );
  $elements['toolbar'] = array(
    '#type' => 'textarea',
    '#title' => t('Toolbar configuration'),
    '#default_value' => json_encode($format->editor_settings['toolbar']),
    '#attributes' => array('class' => array('ckeditor-toolbar-textarea')),
  );

  // @todo: Have this settings form be provided via a plugin hook.
  $elements['plugins']['image'] = filter_editor_image_upload_settings_form($format);
  $elements['plugins']['image'] += array(
    '#type' => 'fieldset',
    '#title' => t('Image uploading'),
    '#attributes' => array(
      'class' => array('ckeditor-plugin-backdropimage'),
      'data-ckeditor-feature-dependency' => 'BackdropImage',
    ),
    '#parents' => array('editor_settings', 'image_upload'),
  );

  $elements['plugins']['style'] = array(
    '#type' => 'fieldset',
    '#title' => t('Style list'),
    '#attributes' => array(
      'class' => array('ckeditor-plugin-style'),
      'data-ckeditor-feature-dependency' => 'Styles',
    ),
  );
  $style_list = '';
  if (isset($format->editor_settings['plugins']['style']['style_list'])) {
    $style_list = _ckeditor_settings_stringify_style_list($format->editor_settings['plugins']['style']['style_list']);
  }
  $elements['plugins']['style']['style_list'] = array(
    '#type' => 'textarea',
    '#rows' => 4,
    '#default_value' => $style_list,
    '#description' => t('A list of classes that will be provided in the "Styles" dropdown. Enter one class on each line in the format: element.class|Label. Example: h1.title|Title.') . '<br />' . t('Each style should be in your theme\'s main CSS as well as in your theme\'s ckeditor-iframe.css file.'),
  );

  array_unshift($form['#validate'], 'ckeditor_settings_form_validate');
  array_unshift($form['#submit'], 'ckeditor_settings_form_submit');
  return $elements;
}

/**
 * Additional validate handler for filter_admin_format_form().
 */
function ckeditor_settings_form_validate($form, &$form_state) {
  $settings = $form_state['values']['editor_settings'];
  $toolbar_string = $settings['toolbar'];
  $result = json_decode($toolbar_string, TRUE);
  if (empty($result)) {
    form_error($form['editor_settings']['toolbar'], t('The CKEditor toolbar configuration could not be saved.'));
  }

  $styles = _ckeditor_settings_parse_style_list($settings['plugins']['style']['style_list']);
  foreach ($styles as $style) {
    if (empty($style['name']) || empty($style['element']) || empty($style['attributes']['class'])) {
      form_error($form['editor_settings']['plugins']['style']['style_list'], t('The CKEditor list of styles is not formatted properly. Be sure to include one style per line, with the format "element.class|Label".'));
    }
  }
}

/**
 * Additional submit handler for filter_admin_format_form().
 */
function ckeditor_settings_form_submit($form, &$form_state) {
  $settings = $form_state['values']['editor_settings'];
  form_set_value($form['editor_settings']['toolbar'], json_decode($settings['toolbar'], TRUE), $form_state);

  $styles = _ckeditor_settings_parse_style_list($settings['plugins']['style']['style_list']);
  form_set_value($form['editor_settings']['plugins']['style']['style_list'], $styles, $form_state);
}

/**
 * Parse a string of styles in the format of element.class|Label into an array.
 *
 * @param string $style_list_string
 *   A list of styles separated by new line characters.
 *
 * @return array
 *   An unindexed array of styles with the following keys:
 *   - name: The label of the style.
 *   - element: The type of element this still will use.
 *   - attributes: An attributes array including the class that will be used.
 *     Note that the class is not an array, as this configuration is passed
 *     directly to CKEditor.
 */
function _ckeditor_settings_parse_style_list($style_list_string) {
  $styles = array();
  foreach (explode("\n", $style_list_string) as $style) {
    $style = trim($style);
    if ($style) {
      @list($element, $label) = explode('|', $style, 2);
      @list($element, $class) = explode('.', $element, 2);
      $styles[] = array(
        'name' => $label,
        'element' => $element,
        'attributes' => array('class' => $class),
      );
    }
  }
  return $styles;
}

/**
 * Convert the stored array of styles into a string for editing.
 *
 * @param array $style_list
 *   The style list as returned by _ckeditor_settings_parse_style_list().
 *
 * @return string
 *   The string representation of the style list.
 */
function _ckeditor_settings_stringify_style_list(array $style_list = NULL) {
  $string = '';
  if ($style_list) {
    foreach ($style_list as $style) {
      $string .= $style['element'] . '.' . $style['attributes']['class'] . '|' . $style['name'] . "\n";
    }
  }
  return $string;
}