<?php
/**
 * @file
 * Date API views argument handler.
 * This argument combines multiple date arguments into a single argument
 * where all fields are controlled by the same date and can be combined
 * with either AND or OR.
 */

/**
 * Date API argument handler.
 */
class date_views_argument_handler extends date_views_argument_handler_simple {
  /**
   * Default value for the date_fields option.
   */
  function option_definition() {
    $options = parent::option_definition();
    $options['date_fields'] = array('default' => array());
    $options['date_method'] = array('default' => 'OR');
    $options['date_group'] = array('default' => 'date');
    return $options;
  }

  /**
   * Add a form element to select date_fields for this argument.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);
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
      '#multiple' => TRUE,
      '#description' => t("Select one or more date fields to filter with this argument."),
    );
    $form['date_method'] = array(
      '#title' => t('Method'),
      '#type' => 'radios',
      '#options' => array('OR' => t('OR'), 'AND' => t('AND')),
      '#default_value' => $this->options['date_method'],
      '#description' => t('Method of handling multiple date fields in the same query. Return items that have any matching date field (date = field_1 OR field_2), or only those with matches in all selected date fields (date = field_1 AND field_2). '),
      );
    $form['date_group'] = array(
      '#type' => 'hidden',
      '#value' => $this->options['date_group'],
    );
  }

  function options_validate(&$form, &$form_state) {

    // Views will whine if we don't have something for the these values even though we removed the option for summaries.
    $form_state['values']['options']['summary']['format'] = 'none';
    $form_state['values']['options']['summary']['options']['none'] = array();

    // It is very important to call the parent function here:
    parent::options_validate($form, $form_state);

    if ($form_state['values']['form_id'] == 'views_ui_config_item_form') {
      $check_fields = array_filter($form_state['values']['options']['date_fields']);
      if (empty($check_fields)) {
        form_error($form['date_fields'], t('You must select at least one date field for this argument.'));
      }
    }
  }

  function options_submit(&$form, &$form_state) {
    // It is very important to call the parent function here:
    parent::options_submit($form, $form_state);
    if ($form_state['values']['form_id'] == 'views_ui_config_item_form') {
      $form_state['values']['options']['date_fields'] = array_filter($form_state['values']['options']['date_fields']);
    }
  }

  // Update the summary values to show selected granularity.
  function admin_summary() {
    $fields = date_views_fields($this->base_table);
    if (!empty($this->options['date_fields'])) {
      $output = array();
      foreach ($this->options['date_fields'] as $field) {
        if (array_key_exists($field, $fields['name'])) {
          $output[] = $fields['name'][$field]['label'];
        }
      }
      return implode('<br />' . $this->options['date_method'] . ' ', $output);
    }
    else {
      return parent::admin_summary();
    }
  }

  /**
   * Provide a list of default behaviors for this argument if the argument
   * is not present.
   *
   * Override this method to provide additional (or fewer) default behaviors.
   */
  function default_actions($which = NULL) {
    $defaults = parent::default_actions();

    // There is no easy way to do summary queries on multiple fields, so remove that option.
    unset($defaults['summary']);

    if ($which && !empty($defaults[$which])) {
      return $defaults[$which];
    }
    else {
      return $defaults;
    }
  }

  /**
   * Set up the query for this argument.
   *
   * The argument sent may be found at $this->argument.
   */
  function query($group_by = FALSE) {

    // @TODO Not doing anything with $group_by yet, need to figure out what has to be done.

    if ($this->date_forbid()) {
      return;
    }
    $query_field = $this->get_query_fields();
    $this->query->set_where_group($this->options['date_method'], $this->options['date_group']);
    $this->granularity = $this->date_handler->arg_granularity($this->argument);
    $this->placeholders = array();

    if (!empty($query_field)) {
      // Use set_where_group() with the selected date_method
      // of 'AND' or 'OR' to create the where clause.
      foreach ($query_field as $count => $query_field) {
        $field = $query_field['field'];
        $this->date_handler = $query_field['date_handler'];
        $this->field = $field['field_name'];
        $this->real_field = $field['field_name'];
        $this->table = $field['table_name'];
        $this->original_table = $field['table_name'];
        if ($field['table_name'] != $this->table || !empty($this->relationship)) {
          $this->table = $this->query->ensure_table($field['table_name'], $this->relationship);
        }
        // $this->table_alias gets set when the first field is processed if otherwise empty.
        // For subsequent fields, we need to be sure it is emptied again.
        elseif (empty($this->relationship)) {
          $this->table_alias = NULL;
        }
        parent::query($group_by);

        $this->placeholders = array_merge($this->placeholders, $this->date_handler->placeholders);
      }
    }
  }

  /**
   * Collect information about our fields we will need to create the right query.
   */
  function get_query_fields() {
    $fields = date_views_fields($this->base_table);
    $fields = $fields['name'];
    $query_field = array();
    foreach ($this->options['date_fields'] as $delta => $name) {
      if (array_key_exists($name, $fields) && $field = $fields[$name]) {
        $date_handler = new date_sql_handler($field['sql_type'], date_default_timezone());
        $date_handler->granularity = $this->options['granularity'];
        $date_handler->db_timezone = date_get_timezone_db($field['tz_handling']);
        $date_handler->local_timezone = date_get_timezone($field['tz_handling']);
        date_views_set_timezone($date_handler, $this, $field);
        $query_field[] = array('field' => $field, 'date_handler' => $date_handler);
      }
    }
  }

}
