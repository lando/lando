<?php

/**
 * @file
 * Definition of views_handler_field_file_extension.
 */

/**
 * Returns a pure file extension of the file, for example 'module'.
 * @ingroup views_field_handlers
 */
class views_handler_field_file_extension extends views_handler_field {
  public function option_definition() {
    $options = parent::option_definition();
    $options['extension_detect_tar'] = array('default' => FALSE, 'bool' => TRUE);
    return $options;
  }

  public function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);
    $form['extension_detect_tar'] = array(
      '#type' => 'checkbox',
      '#title' => t('Detect if tar is part of the extension'),
      '#description' => t("See if the previous extension is '.tar' and if so, add that, so we see 'tar.gz' or 'tar.bz2' instead of just 'gz'."),
      '#default_value' => $this->options['extension_detect_tar'],
    );
  }

  function render($values) {
    $value = $this->get_value($values);
    if (!$this->options['extension_detect_tar']) {
      if (preg_match('/\.([^\.]+)$/', $value, $match)) {
        return $this->sanitize_value($match[1]);
      }
    }
    else {
      $file_parts = explode('.', basename($value));
      // If there is an extension.
      if (count($file_parts) > 1) {
        $extension = array_pop($file_parts);
        $last_part_in_name = array_pop($file_parts);
        if ($last_part_in_name === 'tar') {
          $extension = 'tar.' . $extension;
        }
        return $this->sanitize_value($extension);
      }
    }
  }
}
