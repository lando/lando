<?php

/**
 * @file
 * Definition of views_test_plugin_style_test_mapping.
 */

/**
 * Provides a test mapping style plugin.
 */
class views_test_plugin_style_test_mapping extends views_plugin_style_mapping {

  /**
   * Overrides views_plugin_style_mapping::define_mapping().
   */
  protected function define_mapping() {
    return array(
      'title_field' => array(
        '#title' => t('Title field'),
        '#description' => t('Choose the field with the custom title.'),
        '#toggle' => TRUE,
        '#required' => TRUE,
      ),
      'name_field' => array(
        '#title' => t('Name field'),
        '#description' => t('Choose the field with the custom name.'),
      ),
      'numeric_field' => array(
        '#title' => t('Numeric field'),
        '#description' => t('Select one or more numeric fields.'),
        '#multiple' => TRUE,
        '#toggle' => TRUE,
        '#filter' => 'filter_numeric_fields',
        '#required' => TRUE,
      ),
    );
  }

  /**
   * Restricts the allowed fields to only numeric fields.
   *
   * @param array $fields
   *   An array of field labels, keyed by the field ID.
   */
  protected function filter_numeric_fields(&$fields) {
    foreach ($this->view->field as $id => $field) {
      if (!($field instanceof views_handler_field_numeric)) {
        unset($fields[$id]);
      }
    }
  }
}
