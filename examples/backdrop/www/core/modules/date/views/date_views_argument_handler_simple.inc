<?php
/**
 * @file
 * Date API views argument handler.
 */

/**
 * Date API argument handler.
 */
class date_views_argument_handler_simple extends views_handler_argument_date {

  /**
   * @var date_sql_handler
   */
  var $date_handler;

  /**
   * @var string
   */
  var $format;

  /**
   * @var string
   */
  var $sql_format;

  /**
   * @var array
   */
  var $placeholders = array();

  /**
   * @var string
   */
  var $base_table;

  /**
   * @var string
   */
  var $original_table;

  /**
   * @var DateTime
   */
  protected $min_date;

  /**
   * @var DateTime
   */
  protected $max_date;

  /**
   * Get granularity.
   *
   * Use it to create the formula and a format for the results.
   */
  function init(&$view, &$options) {
    parent::init($view, $options);

    // Add a date handler.
    $this->date_handler = new date_sql_handler(DATE_UNIX);
    if (!empty($this->definition['field_name'])) {
      $field = field_info_field($this->definition['field_name']);
      if (!empty($field) && !empty($field['type'])) {
        $this->date_handler->date_type = $field['type'];
        $this->original_table = $this->definition['table'];
      }
      $this->date_handler->db_timezone = date_get_timezone_db($field['settings']['tz_handling']);
      $this->date_handler->local_timezone = date_get_timezone($field['settings']['tz_handling']);
    }
    $this->date_handler->granularity = $this->options['granularity'];
    // This value needs to be initialized so
    // it exists even if the query doesn't run.
    $this->date_handler->placeholders = array();

    $this->format = $this->date_handler->views_formats($this->date_handler->granularity, 'display');
    $this->sql_format = $this->date_handler->views_formats($this->date_handler->granularity, 'sql');
    // $this->arg_format is the format the parent date
    // handler will use to create a default argument.
    $this->arg_format = $this->format();

    // Identify the base table for this field.
    // It will be used to call for the right query field options.
    $this->base_table = $this->table;

  }

  /**
   * {@inheritdoc}
   */
  function format() {
    if (!empty($this->options['granularity'])) {
      return $this->date_handler->views_formats($this->options['granularity']);
    }
    else {
      return !empty($this->options[$this->option_name]) ? $this->options[$this->option_name] : 'Y-m';
    }
  }

  /**
   * Set the empty argument value to the current date.
   *
   * Formatted appropriately for this argument.
   */
  function get_default_argument($raw = FALSE) {
    if (!$raw && $this->options['default_argument_type'] == 'date') {
      $granularity = $this->options['granularity'];
      if ($granularity == 'week') {
        $now = date_now();
        $week = date_week(date_format($now, 'Y-m-d'));
        $value = date_format($now, 'o') . '-W' . date_pad($week);
      }
      else {
        $value = date($this->arg_format, REQUEST_TIME);
      }
      backdrop_alter('date_default_argument', $this, $value);

      return $value;
    }

    // Let the parent argument handle options like node created date.
    return parent::get_default_argument($raw);
  }

  /**
   * Default value for the date_fields option.
   */
  function option_definition() {
    $options = parent::option_definition();
    $options['year_range'] = array('default' => '-3:+3');
    $options['granularity'] = array('default' => 'month');
    $options['granularity_reset'] = array('default' => FALSE);
    $options['default_argument_type']['default'] = 'date';
    $options['add_delta'] = array('default' => '');
    $options['use_fromto'] = array('default' => '');
    $options['title_format'] = array('default' => '');
    $options['title_format_custom'] = array('default' => '');
    return $options;
  }

  /**
   * Add a form element to select date_fields for this argument.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Add an option to control the format of the summary.
    $options = array(
      '' => t('Default format'),
      'custom' => t('Custom format'),
    );
    $example_month = date_format_date(date_example_date(), 'custom', $this->date_handler->views_formats('month', 'display'));
    $example_day = date_format_date(date_example_date(), 'custom', $this->date_handler->views_formats('day', 'display'));

    $form['title_format'] = array(
      '#type' => 'select',
      '#title' => t('Date format options'),
      '#default_value' => $this->options['title_format'],
      '#options' => $options,
      '#description' => t('The date format used in titles and summary links for this argument. The default format is based on the granularity of the filter, i.e. month: @example_month, day: @example_day.', array('@example_month' => $example_month, '@example_day' => $example_day)),
      '#attributes' => array('class' => array('dependent-options')),
      '#states' => array(
        'visible' => array(
          ':input[name="options[default_action]"]' => array(
            'value' => 'summary',
          ),
        ),
      ),
    );

    $form['title_format_custom'] = array(
      '#type' => 'textfield',
      '#title' => t('Custom summary date format'),
      '#default_value' => $this->options['title_format_custom'],
      '#description' => t('A custom format for the title and summary date format. Define a php date format string like "m-d-Y H:i" (see <a href="http://php.net/date">http://php.net/date</a> for more details).'),
      '#attributes' => array('class' => array('dependent-options')),
      '#states' => array(
        'visible' => array(
          ':input[name="options[title_format]"]' => array(
            'value' => 'custom',
          ),
        ),
      ),
    );

    // Get default granularity options
    $options = $this->date_handler->date_parts();
    // Add the 'week' option.
    $options += array(
      'week' => t('Week', array(), array(
        'context' => 'datetime',
      )),
    );

    $form['granularity'] = array(
      '#title' => t('Granularity'),
      '#type' => 'radios',
      '#options' => $options,
      '#default_value' => $this->options['granularity'],
      '#description' => t("Select the type of date value to be used in defaults, summaries, and navigation. For example, a granularity of 'month' will set the default date to the current month, summarize by month in summary views, and link to the next and previous month when using date navigation."),
    );

    $form['granularity_reset'] = array(
      '#title' => t('Use granularity from argument value'),
      '#type' => 'checkbox',
      '#default_value' => $this->options['granularity_reset'],
      '#description' => t("If the granularity of argument value is different from selected, use it from argument value."),
    );

    $form['year_range'] = array(
      '#title' => t('Date year range'),
      '#type' => 'textfield',
      '#default_value' => $this->options['year_range'],
      '#description' => t("Set the allowable minimum and maximum year range for this argument, either a -X:+X offset from the current year, like '-3:+3' or an absolute minimum and maximum year, like '2005:2010' . When the argument is set to a date outside the range, the page will be returned as 'Page not found (404)' ."),
    );

    $form['use_fromto'] = array(
      '#type' => 'radios',
      '#title' => t('Dates to compare'),
      '#default_value' => $this->options['use_fromto'],
      '#options' => array('' => t('Start/End date range'), 'no' => t('Only this field')),
      '#description' => t("If selected the view will check if any value starting with the 'Start' date and ending with the 'End' date matches the view criteria. Otherwise the view will be limited to the specifically selected fields. Comparing to the whole Start/End range is the recommended setting when using this filter in a Calendar. When using the Start/End option, it is not necessary to add both the Start and End fields to the filter, either one will do."),
    );

    $access = TRUE;
    if (!empty($this->definition['field_name'])) {
      $field = field_info_field($this->definition['field_name']);
      $access = $field['cardinality'] != 1;
    }
    $form['add_delta'] = array(
      '#type' => 'radios',
      '#title' => t('Add multiple value identifier'),
      '#default_value' => $this->options['add_delta'],
      '#options' => array('' => t('No'), 'yes' => t('Yes')),
      '#description' => t('Add an identifier to the view to show which multiple value date fields meet the filter criteria. Note: This option may introduce duplicate values into the view. Required when using multiple value fields in a Calendar or any time you want the node view of multiple value dates to display only the values that match the view filters.'),
      // Only let mere mortals tweak this setting for multi-value fields.
      '#access' => $access,
    );
  }

  /**
   * {@inheritdoc}
   */
  function options_validate(&$form, &$form_state) {
    // It is very important to call the parent function here:
    parent::options_validate($form, $form_state);
    if (!preg_match('/^(?:\-[0-9]{1,4}|[0-9]{4}):(?:[\+\-][0-9]{1,4}|[0-9]{4})$/', $form_state['values']['options']['year_range'])) {
      form_error($form['year_range'], t('Date year range must be in the format -9:+9, 2005:2010, -9:2010, or 2005:+9'));
    }
  }

  /**
   * Provide a link to the next level of the view from the summary.
   */
  function summary_name($data) {
    $value = $data->{$this->name_alias};
    if (empty($value) && !empty($this->definition['empty field name'])) {
      return $this->definition['empty field name'];
    }
    elseif (empty($value)) {
      return $this->options['wildcard_substitution'];
    }
    $format = !empty($this->options['title_format_custom']) && !empty($this->options['title_format_custom']) ? $this->options['title_format_custom'] : $this->date_handler->views_formats($this->options['granularity'], 'display');
    $range = $this->date_handler->arg_range($value);
    return date_format_date($range[0], 'custom', $format);
  }

  /**
   * Provide a title for the view based on the argument value.
   */
  function title() {
    $format = !empty($this->options['title_format_custom']) && !empty($this->options['title_format_custom']) ? $this->options['title_format_custom'] : $this->date_handler->views_formats($this->options['granularity'], 'display');
    $range = $this->date_handler->arg_range($this->argument);
    return date_format_date($range[0], 'custom', $format);
  }

  /**
   * Provide the argument to use to link from the summary to the next level.
   *
   * This will be called once per row of a summary, and used as part of
   * $view->get_url().
   *
   * @param object $data
   *   The query results for the row.
   */
  function summary_argument($data) {
    $format = $this->date_handler->views_formats($this->options['granularity'], 'sql');
    $value = $data->{$this->name_alias};
    if (empty($value)) {
      return $this->options['exception']['value'];
    }
    $range = $this->date_handler->arg_range($value);
    return date_format_date($range[0], 'custom', $format);
  }

  /**
   * Inject a test for valid date range before the summary query.
   */
  function summary_query() {

    // @TODO The summary values are computed by the database.
    // Unless the database has built-in timezone handling it will use
    // a fixed offset, which will not be right for all dates.
    // The only way I can see to make this work right is to store the offset
    // for each date in the database so it can be added to the base
    // date value before the database formats the result. Because this is a huge
    // architectural change, it won't go in until we start a new branch.
    $this->formula = $this->date_handler->sql_format($this->sql_format, $this->date_handler->sql_field("***table***.$this->real_field"));
    $this->ensure_my_table();
    // Now that our table is secure, get our formula.
    $formula = $this->get_formula();

    // Add the field, give it an alias that does NOT match the actual
    // field name or grouping won't work right.
    $this->base_alias = $this->name_alias = $this->query->add_field(NULL, $formula, $this->field . '_summary');
    $this->query->set_count_field(NULL, $formula, $this->field);

    $this->summary_basics(FALSE);
  }

  /**
   * Inject a test for valid date range before the regular query.
   *
   * Override the parent query to be able to control the $group.
   */
  function query($group_by = FALSE) {

    // @TODO Not doing anything with $group_by yet,
    // need to figure out what has to be done.

    if ($this->date_forbid()) {
      return;
    }

    // See if we need to reset granularity based on an argument value.
    // Make sure we don't try to reset to some bogus value if someone has
    // typed in an unexpected argument.
    if ($this->options['granularity_reset'] && $granularity = $this->date_handler->arg_granularity($this->argument)) {
      $this->date_handler->granularity = $granularity;
      $this->format = $this->date_handler->views_formats($this->date_handler->granularity, 'display');
      $this->sql_format = $this->date_handler->views_formats($this->date_handler->granularity, 'sql');
    }
    $this->granularity = $this->date_handler->granularity;
    $this->ensure_my_table();
    $group = !empty($this->options['date_group']) ? $this->options['date_group'] : 0;

    // If requested, add the delta field to the view so
    // we can later find the value that matched our query.
    if (!empty($this->options['add_delta']) && (substr($this->real_field, -6) == '_value' || substr($this->real_field, -7) == '_value2')) {
      $this->query->add_field($this->table_alias, 'delta');
      $real_field_name = str_replace(array('_value', '_value2'), '', $this->real_field);
      $this->query->add_field($this->table_alias, 'entity_id', 'date_id_' . $real_field_name);
      $this->query->add_field($this->table_alias, 'delta', 'date_delta_' . $real_field_name);
    }

    $format = $this->date_handler->granularity == 'week' ? DATE_FORMAT_DATETIME : $this->sql_format;
    $view_min = date_format($this->min_date, $format);
    $view_max = date_format($this->max_date, $format);
    $view_min_placeholder = $this->placeholder();
    $view_max_placeholder = $this->placeholder();
    $this->date_handler->placeholders = array($view_min_placeholder => $view_min, $view_max_placeholder => $view_max);

    // Are we comparing this field only or the Start/End date range
    // to the view criteria?
    if (!empty($this->options['use_fromto'])) {

      // The simple case, match the field to the view range.
      $field = $this->date_handler->sql_field($this->table_alias . '.' . $this->real_field, NULL, $this->min_date);
      $field = $this->date_handler->sql_format($format, $field);
      $this->query->add_where_expression($group, "$field >= $view_min_placeholder AND $field <= $view_max_placeholder", array($view_min_placeholder => $view_min, $view_max_placeholder => $view_max));

    }
    else {

      // Look for the intersection of the range
      // of the date field with the range of the view.
      // Get the Start/End values for this field.
      // Retrieve using the original table name.
      // Swap the current table name (adjusted for relationships)
      // into the query.
      // @TODO We may be able to use Views substitutions here,
      // investigate that later.
      $fields = date_views_fields($this->base_table);
      $fields = $fields['name'];
      $fromto = $fields[$this->original_table . '.' . $this->real_field]['fromto'];

      $value_min = str_replace($this->original_table, $this->table_alias, $fromto[0]);
      $value_max = str_replace($this->original_table, $this->table_alias, $fromto[1]);
      $field_min = $this->date_handler->sql_field($value_min, NULL, $this->min_date);
      $field_min = $this->date_handler->sql_format($format, $field_min);
      $field_max = $this->date_handler->sql_field($value_max, NULL, $this->max_date);
      $field_max = $this->date_handler->sql_format($format, $field_max);
      $this->query->add_where_expression($group, "$field_max >= $view_min_placeholder AND $field_min <= $view_max_placeholder", array($view_min_placeholder => $view_min, $view_max_placeholder => $view_max));
    }
  }

  /**
   * Add a callback.
   *
   * To determine if we have moved outside
   * the valid date range for this argument.
   */
  function date_forbid() {
    if (empty($this->argument)) {
      return TRUE;
    }
    $date_range = $this->date_handler->arg_range($this->argument);
    $this->min_date = $date_range[0];
    $this->max_date = $date_range[1];
    $this->limit = date_range_years($this->options['year_range']);
    $group = !empty($this->options['date_group']) ? $this->options['date_group'] : 0;

    // See if we're outside the allowed date range for our argument.
    if (date_format($this->min_date, 'Y') < $this->limit[0] || date_format($this->max_date, 'Y') > $this->limit[1]) {
      $this->forbid = TRUE;
      $this->view->build_info['fail'] = TRUE;
      return TRUE;
    }
    return FALSE;
  }

}
