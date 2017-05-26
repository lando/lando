<?php

/**
 * @file
 * Definition of views_plugin_style_mapping.
 */

/**
 * Allows fields to be mapped to specific use cases.
 */
abstract class views_plugin_style_mapping extends views_plugin_style {

  /**
   * Builds the list of field mappings.
   *
   * @return array
   *   An associative array, keyed by the field name, containing the following
   *   key-value pairs:
   *   - #title: The human-readable label for this field.
   *   - #default_value: The default value for this field. If not provided, an
   *     empty string will be used.
   *   - #description: A description of this field.
   *   - #required: Whether this field is required.
   *   - #filter: (optional) A method on the plugin to filter field options.
   *   - #toggle: (optional) If this select should be toggled by a checkbox.
   */
  abstract protected function define_mapping();

  /**
   * Overrides views_plugin_style::option_definition().
   */
  function option_definition() {
    $options = parent::option_definition();

    // Parse the mapping and add a default for each.
    foreach ($this->define_mapping() as $key => $value) {
      $default = !empty($value['#multiple']) ? array() : '';
      $options['mapping']['contains'][$key] = array(
        'default' => isset($value['#default_value']) ? $value['#default_value'] : $default,
      );
      if (!empty($value['#toggle'])) {
        $options['mapping']['contains']["toggle_$key"] = array(
          'default' => FALSE,
          'bool' => TRUE,
        );
      }
    }

    return $options;
  }

  /**
   * Overrides views_plugin_style::options_form().
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Get the mapping.
    $mapping = $this->define_mapping();

    // Restrict the list of defaults to the mapping, in case they have changed.
    $options = array_intersect_key($this->options['mapping'], $mapping);

    // Get the labels of the fields added to this display.
    $field_labels = $this->display->handler->get_field_labels();

    // Provide some default values.
    $defaults = array(
      '#type' => 'select',
      '#required' => FALSE,
      '#multiple' => FALSE,
    );

    // For each mapping, add a select element to the form.
    foreach ($options as $key => $value) {
      // If the field is optional, add a 'None' value to the top of the options.
      $field_options = array();
      $required = !empty($mapping[$key]['#required']);
      if (!$required && empty($mapping[$key]['#multiple'])) {
        $field_options = array('' => t('- None -'));
      }
      $field_options += $field_labels;

      // Optionally filter the available fields.
      if (isset($mapping[$key]['#filter'])) {
        $this->view->init_handlers();
        $this::$mapping[$key]['#filter']($field_options);
        unset($mapping[$key]['#filter']);
      }

      // These values must always be set.
      $overrides = array(
        '#options' => $field_options,
        '#default_value' => $options[$key],
      );

      // Optionally allow the select to be toggleable.
      if (!empty($mapping[$key]['#toggle'])) {
        $form['mapping']["toggle_$key"] = array(
          '#type' => 'checkbox',
          '#title' => t('Use a custom %field_name', array('%field_name' => strtolower($mapping[$key]['#title']))),
          '#default_value' => $this->options['mapping']["toggle_$key"],
        );
        $overrides['#states']['visible'][':input[name="style_options[mapping][' . "toggle_$key" . ']"]'] = array('checked' => TRUE);
      }

      $form['mapping'][$key] = $overrides + $mapping[$key] + $defaults;
    }
  }

  /**
   * Overrides views_plugin_style::render().
   *
   * Provides the mapping definition as an available variable.
   */
  function render() {
    return theme($this->theme_functions(), array(
      'view' => $this->view,
      'options' => $this->options,
      'rows' => $this->view->result,
      'mapping' => $this->define_mapping(),
    ));
  }

}
