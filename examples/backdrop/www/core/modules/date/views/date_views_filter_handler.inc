<?php
/**
 * @file
 * A flexible, configurable date filter.
 * This filter combines multiple date filters into a single filter
 * where all fields are controlled by the same date and can be combined
 * with either AND or OR.
 */
class date_views_filter_handler extends date_views_filter_handler_simple {
  protected $query_fields = array();

  // Set default values for the date filter.
  function option_definition() {
    $options = parent::option_definition();
    $options['date_fields'] = array('default' => array());
    $options['date_method'] = array('default' => 'OR');
    $options['date_group'] = array('default' => 'date');
    return $options;
  }

  function op_between($field) {
    $this->date_combine_conditions('op_between');
  }

  function op_simple($field) {
    $this->date_combine_conditions('op_simple');
  }

  function op_contains($field) {
    $this->date_combine_conditions('op_contains');
  }

  /**
   * Combines multiple date WHERE expressions into a single WHERE expression.
   *
   * @param string $function
   *   The function name to use to add individual conditions. Either 'op_simple'
   *   or 'op_between'.
   */
  protected function date_combine_conditions($function) {
    $this->get_query_fields();
    if (empty($this->query_fields)) {
      return;
    }

    // Create a custom filter group for the conditions.
    $this->query->set_where_group($this->options['date_method'], $this->options['date_group']);
    // Add each condition to the custom filter group.
    foreach ((array) $this->query_fields as $query_field) {
      $field = $query_field['field'];
      $this->date_handler = $query_field['date_handler'];

      // Respect relationships when determining the table alias.
      if ($field['table_name'] != $this->table || !empty($this->relationship)) {
        $related_table_alias = $this->query->ensure_table($field['table_name'], $this->relationship);
      }
      else {
        $related_table_alias = NULL;
      }
      $table_alias = !empty($related_table_alias) ? $related_table_alias : $field['table_name'];
      $field_name = $table_alias . '.' . $field['field_name'];

      // Call the appropriate function, either 'op_between' or 'op_simple'.
      parent::$function($field_name);
    }

    // Gather all of the condition strings and their placeholders.
    $conditions = array();
    $placeholders = array();
    foreach ($this->query->where[$this->options['date_group']]['conditions'] as $condition) {
      $conditions[] = $condition['field'];
      $placeholders += $condition['value'];
    }

    // Remove the conditions from the custom filter group.
    unset($this->query->where[$this->options['date_group']]);

    // Combine all of the conditions into one string.
    $conditions = implode(' ' . $this->options['date_method'] . ' ', $conditions);

    // Add it to the filter group chosen in the Views UI.
    $this->query->add_where_expression($this->options['group'], $conditions, $placeholders);
  }

  function extra_options_form(&$form, &$form_state) {
    parent::extra_options_form($form, $form_state);

    $fields = date_views_fields($this->base_table);
    $options = array();
    foreach ($fields['name'] as $name => $field) {
      $options[$name] = $field['label'];
    }

    $form['date_fields'] = array(
      '#title' => t('Date field(s)'),
      '#type' => 'checkboxes',
      '#options' => $options,
      '#default_value' => $this->options['date_fields'],
      '#multiple' => FALSE,
      '#description' => t('Select date field(s) to filter.'),
      '#required' => TRUE,
    );
    $form['date_method'] = array(
      '#title' => t('Method'),
      '#type' => 'radios',
      '#options' => array('OR' => t('OR'), 'AND' => t('AND')),
      '#default_value' => $this->options['date_method'],
      '#description' => t('Method of handling multiple date fields in the same query. Return items that have any matching date field (date = field_1 OR field_2), or only those with matches in all selected date fields (date = field_1 AND field_2).'),
      );
  }

  function extra_options_validate($form, &$form_state) {
    $check_fields = array_filter($form_state['values']['options']['date_fields']);
    if (empty($check_fields)) {
      form_error($form['date_fields'], t('You must select at least one date field for this filter.'));
    }
  }

  function extra_options_submit($form, &$form_state) {
    $form_state['values']['options']['date_fields'] = array_filter($form_state['values']['options']['date_fields']);
  }

  // Update the summary values to provide
  // meaningful information for each option.
  function admin_summary() {
    if (empty($this->options['date_fields'])) {
      return t('Missing date fields!');
    }
    $handler = $this->date_handler;

    $fields = date_views_fields($this->view->base_table);
    $output = array();
    if (!empty($this->options['date_fields'])) {
      foreach ($this->options['date_fields'] as $field) {
        if (array_key_exists($field, $fields['name'])) {
          $output[] = $fields['name'][$field]['label'];
        }
      }
    }
    $field = implode(' ' . $this->options['date_method'] . ' ', $output);
    $output = "$field " . check_plain($this->operator) . ' ';
    $parts = $handler->date_parts();
    $widget_options = $this->widget_options();
    // If the filter is exposed, display the granularity.
    if ($this->options['exposed']) {
      return t('(@field) <strong>Exposed</strong> @widget @format', array('@field' => $field, '@format' => $parts[$handler->granularity], '@widget' => $widget_options[$this->options['form_type']]));
    }
    // If not exposed, display the value.
    if (in_array($this->operator, $this->operator_values(2))) {
      $min = check_plain(!empty($this->options['default_date']) ? $this->options['default_date'] : $this->options['value']['min']);
      $max = check_plain(!empty($this->options['default_to_date']) ? $this->options['default_to_date'] : $this->options['value']['max']);
      $output .= t('@min and @max', array('@min' => $min, '@max' => $max));
    }
    else {
      $output .= check_plain(!empty($this->options['default_date']) ? $this->options['default_date'] : $this->options['value']['value']);
    }
    return $output;
  }

  function get_query_fields() {
    $fields = date_views_fields($this->base_table);
    $fields = $fields['name'];
    $this->query_fields = array();
    foreach ((array) $this->options['date_fields'] as $delta => $name) {
      if (array_key_exists($name, $fields) && $field = $fields[$name]) {
        $date_handler = new date_sql_handler($field['sql_type'], date_default_timezone());
        $date_handler->granularity = $this->options['granularity'];
        $date_handler->db_timezone = date_get_timezone_db($field['tz_handling']);
        $date_handler->local_timezone = date_get_timezone($field['tz_handling']);
        $this->query_fields[] = array('field' => $field, 'date_handler' => $date_handler);
      }
    }
  }
}
