<?php

/**
 * @file
 * Hooks provided by the Date module.
 */

/**
 * Alter the default value for a date argument.
 *
 * @param object $argument
 *   The argument object.
 * @param string $value
 *   The default value created by the argument handler.
 */
function hook_date_default_argument_alter(&$argument, &$value) {
  $style_options = $style_options = $argument->view->display_handler->get_option('style_options');
  if (!empty($style_options['track_date'])) {
    $default_date = date_now();
    $value = $default_date->format($argument->arg_format);
  }
}

/**
 * Alter the entity before formatting it.
 *
 * @param object $entity
 *   The entity object being viewed.
 * @param array $variables
 *   The variables passed to the formatter.
 *   - entity: The $entity object.
 *   - entity_type: The $entity_type.
 *   - field: The $field array.
 *   - instance: The $instance array.
 *   - langcode: The $langcode.
 *   - items: The $items array.
 *   - display: The $display array.
 *   - dates: The processed dates array, empty at this point.
 *   - attributes: The attributes array, empty at this point.
 */
function hook_date_formatter_pre_view_alter(&$entity, &$variables) {
  if (!empty($entity->view)) {
    $field = $variables['field'];
    $date_id = 'date_id_' . $field['field_name'];
    $date_delta = 'date_delta_' . $field['field_name'];
    $date_item = $entity->view->result[$entity->view->row_index];
    if (!empty($date_item->$date_id)) {
      $entity->date_id = 'date.' . $date_item->$date_id . '.' . $field['field_name'] . '.' . $date_item->$date_delta . '.0';
    }
  }
}

/**
 * Alter the dates array created by date_formatter_process().
 *
 * @param array $dates
 *   The $dates array created by the Date module.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *   - format: The string $format.
 *   - entity_type: The $entity_type.
 *   - entity: The $entity object.
 *   - langcode: The string $langcode.
 *   - item: The $item array.
 *   - display: The $display array.
 */
function hook_date_formatter_dates_alter(&$dates, $context) {
  $field = $context['field'];
  $instance = $context['instance'];
  $format = $context['format'];
  $entity_type = $context['entity_type'];
  $entity = $context['entity'];
  $date1 = $dates['value']['local']['object'];
  $date2 = $dates['value2']['local']['object'];

  $is_all_day = date_all_day_field($field, $instance, $date1, $date2);

  $all_day1 = '';
  $all_day2 = '';
  if ($format != 'format_interval' && $is_all_day) {
    $all_day1 = theme('date_all_day', array(
      'field' => $field,
      'instance' => $instance,
      'which' => 'date1',
      'date1' => $date1,
      'date2' => $date2,
      'format' => $format,
      'entity_type' => $entity_type,
      'entity' => $entity));
    $all_day2 = theme('date_all_day', array(
      'field' => $field,
      'instance' => $instance,
      'which' => 'date2',
      'date1' => $date1,
      'date2' => $date2,
      'format' => $format,
      'entity_type' => $entity_type,
      'entity' => $entity));
    $dates['value']['formatted_time'] = theme('date_all_day_label');
    $dates['value2']['formatted_time'] = theme('date_all_day_label');
    $dates['value']['formatted'] = $all_day1;
    $dates['value2']['formatted'] = $all_day2;
  }
}

/**
 * Alter the date_text element before the rest of the validation is run.
 *
 * @param array $element
 *   The $element array.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $input
 *   The array of input values to be validated.
 */
function hook_date_text_pre_validate_alter(&$element, &$form_state, &$input) {
  // Let Date module massage the format for all day values so they will pass
  // validation. The All day flag, if used, actually exists on the parent
  // element.
  date_all_day_value($element, $form_state);
}

/**
 * Alter the date_select element before the rest of the validation is run.
 *
 * @param array $element
 *   The $element array.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $input
 *   The array of input values to be validated.
 */
function hook_date_select_pre_validate_alter(&$element, &$form_state, &$input) {
  // Let Date module massage the format for all day values so they will pass
  // validation. The All day flag, if used, actually exists on the parent
  // element.
  date_all_day_value($element, $form_state);
}

/**
 * Alter the date_popup element before the rest of the validation is run.
 *
 * @param array $element
 *   The $element array.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $input
 *   The array of input values to be validated.
 */
function hook_date_popup_pre_validate_alter(&$element, &$form_state, &$input) {
  // Let Date module massage the format for all day values so they will pass
  // validation. The All day flag, if used, actually exists on the parent
  // element.
  date_all_day_value($element, $form_state);
}

/**
 * Alter the date_combo element before the rest of the validation is run.
 *
 * @param array $element
 *   The $element array.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *   - item: The $item array.
 *
 * @see date_combo_element_process()
 */
function hook_date_combo_pre_validate_alter(&$element, &$form_state, $context) {
  if (!empty($context['item']['all_day'])) {

    $field = $context['field'];

    // If we have an all day flag on this date and the time is empty, change the
    // format to match the input value so we don't get validation errors.
    $element['#date_is_all_day'] = TRUE;
    $element['value']['#date_format'] = date_part_format('date', $element['value']['#date_format']);
    if (!empty($field['settings']['todate'])) {
      $element['value2']['#date_format'] = date_part_format('date', $element['value2']['#date_format']);
    }
  }
}

/**
 * Alter the local start date objects created by the date_combo validation.
 *
 * This is called before the objects are converted back to the database timezone
 * and stored.
 *
 * @param object $date
 *   The $date object.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *  - field: The $field array.
 *  - instance: The $instance array.
 *  - item: The $item array.
 *  - element: The $element array.
 */
function hook_date_combo_validate_date_start_alter(&$date, &$form_state, $context) {
  // If this is an 'All day' value, set the time to midnight.
  if (!empty($context['element']['#date_is_all_day'])) {
    $date->setTime(0, 0, 0);
  }
}

/**
 * Alter the local end date objects created by the date_combo validation.
 *
 * This is called before the objects are converted back to the database timezone
 * and stored.
 *
 * @param object $date
 *   The $date object.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *  - field: The $field array.
 *  - instance: The $instance array.
 *  - item: The $item array.
 *  - element: The $element array.
 */
function hook_date_combo_validate_date_end_alter(&$date, &$form_state, $context) {
  // If this is an 'All day' value, set the time to midnight.
  if (!empty($context['element']['#date_is_all_day'])) {
    $date->setTime(0, 0, 0);
  }
}

/**
 * Alter the date_text widget element.
 *
 * @param array $element
 *   An associative array containing the properties of the date_text element.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - form: Nested array of form elements that comprise the form.
 *
 * @see date_text_element_process()
 */
function hook_date_text_process_alter(&$element, &$form_state, $context) {
  $all_day_id = !empty($element['#date_all_day_id']) ? $element['#date_all_day_id'] : '';
  if ($all_day_id != '') {
    // All Day handling on text dates works only if the user leaves the time out
    // of the input value. There is no element to hide or show.
  }
}

/**
 * Alter the date_select widget element.
 *
 * @param array $element
 *   An associative array containing the properties of the date_select element.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - form: Nested array of form elements that comprise the form.
 *
 * @see date_select_element_process()
 */
function hook_date_select_process_alter(&$element, &$form_state, $context) {
  // Hide or show the element in reaction to the all_day status for the element.
  $all_day_id = !empty($element['#date_all_day_id']) ? $element['#date_all_day_id'] : '';
  if ($all_day_id != '') {
    foreach (array('hour', 'minute', 'second', 'ampm') as $field) {
      if (array_key_exists($field, $element)) {
        $element[$field]['#states'] = array(
          'visible' => array(
            'input[name="' . $all_day_id . '"]' => array('checked' => FALSE),
          ),
        );
      }
    }
  }
}

/**
 * Alter the date_popup widget element.
 *
 * @param array $element
 *   An associative array containing the properties of the date_popup element.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - form: Nested array of form elements that comprise the form.
 *
 * @see date_popup_element_process()
 */
function hook_date_popup_process_alter(&$element, &$form_state, $context) {
  // Hide or show the element in reaction to the all_day status for the element.
  $all_day_id = !empty($element['#date_all_day_id']) ? $element['#date_all_day_id'] : '';
  if ($all_day_id != '' && array_key_exists('time', $element)) {
    $element['time']['#states'] = array(
      'visible' => array(
        'input[name="' . $all_day_id . '"]' => array('checked' => FALSE),
      ),
    );
  }
}

/**
 * Alter the date_combo element after the Date module is finished with it.
 *
 * @param array $element
 *   The $element array.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *   - form: Nested array of form elements that comprise the form.
 */
function hook_date_combo_process_alter(&$element, &$form_state, $context) {
  $field = $context['field'];
  $instance = $context['instance'];
  $field_name = $element['#field_name'];
  $delta = $element['#delta'];

  // Add a date repeat form element, if needed.
  // We delayed until this point so we don't bother adding it to hidden fields.
  if ($instance['settings']['extend']) {
    $element['another_element'] = array(
      '#type' => 'checkbox',
      '#title' => t('New option on the date field'),
    );
  }
}

/**
 * Alter the date_timezone widget element.
 *
 * @param array $element
 *   An associative array containing the properties of the date_select element.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - form: Nested array of form elements that comprise the form.
 *
 * @see date_timezone_element_process()
 */
function hook_date_timezone_process_alter(&$element, &$form_state, $context) {
  // @todo.
}

/**
 * Alter the date_year_range widget element.
 *
 * @param array $element
 *   An associative array containing the properties of the date_select element.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - form: Nested array of form elements that comprise the form.
 *
 * @see date_year_range_element_process()
 */
function hook_date_year_range_process_alter(&$element, &$form_state, $context) {
  // @todo.
}

/**
 * Alter a date field settings form.
 *
 * @param array $form
 *   Nested array of form elements that comprise the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *   - has_data: The value of $has_data.
 *
 * @see hook_field_settings_form()
 */
function hook_date_field_settings_form_alter(&$form, $context) {
  $field = $context['field'];
  $instance = $context['instance'];
  $has_data = $context['has_data'];

  $form['repeat'] = array(
    '#type' => 'select',
    '#title' => t('Repeating date'),
    '#default_value' => $field['settings']['repeat'],
    '#options' => array(0 => t('No'), 1 => t('Yes')),
    '#attributes' => array('class' => array('container-inline')),
    '#description' => t("Repeating dates use an 'Unlimited' number of values. Instead of the 'Add more' button, they include a form to select when and how often the date should repeat."),
    '#disabled' => $has_data,
  );
}

/**
 * Alter a date field instance settings form.
 *
 * @param array $form
 *   Nested array of form elements that comprise the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *
 * @see hook_field_instance_settings_form()
 */
function hook_date_field_instance_settings_form_alter(&$form, $context) {
  $field = $context['field'];
  $instance = $context['instance'];
  $form['new_setting'] = array(
    '#type' => 'textfield',
    '#default_value' => '',
    '#title' => t('My new setting'),
  );
}

/**
 * Alter a date field widget settings form.
 *
 * @param array $form
 *   Nested array of form elements that comprise the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *
 * @see hook_field_widget_settings_form()
 */
function hook_date_field_widget_settings_form_alter(&$form, $context) {
  $field = $context['field'];
  $instance = $context['instance'];
  $form['new_setting'] = array(
    '#type' => 'textfield',
    '#default_value' => '',
    '#title' => t('My new setting'),
  );
}

/**
 * Alter a date field formatter settings form.
 *
 * @param array $form
 *   Nested array of form elements that comprise the form.
 * @param array $form_state
 *   A keyed array containing the current state of the form.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *   - view_mode: The formatter view mode.
 *
 * @see hook_field_formatter_settings_form()
 */
function hook_date_field_formatter_settings_form_alter(&$form, &$form_state, $context) {
  $field = $context['field'];
  $instance = $context['instance'];
  $view_mode = $context['view_mode'];
  $display = $instance['display'][$view_mode];
  $formatter = $display['type'];
  if ($formatter == 'date_default') {
    $form['show_repeat_rule'] = array(
      '#title' => t('Repeat rule:'),
      '#type' => 'select',
      '#options' => array(
        'show' => t('Show repeat rule'),
        'hide' => t('Hide repeat rule')),
      '#default_value' => $field['settings']['show_repeat_rule'],
      '#access' => $field['settings']['repeat'],
      '#weight' => 5,
    );
  }
}

/**
 * Alter a date field formatter settings summary.
 *
 * @param array $summary
 *   An array of strings to be concatenated into a short summary of the
 *   formatter settings.
 * @param array $context
 *   An associative array containing the following keys:
 *   - field: The $field array.
 *   - instance: The $instance array.
 *   - view_mode: The formatter view mode.
 *
 * @see hook_field_formatter_settings_summary()
 */
function hook_date_field_formatter_settings_summary_alter(&$summary, $context) {
  $field = $context['field'];
  $instance = $context['instance'];
  $view_mode = $context['view_mode'];
  $display = $instance['display'][$view_mode];
  $formatter = $display['type'];
  $settings = $display['settings'];
  if (isset($settings['show_repeat_rule']) && !empty($field['settings']['repeat'])) {
    if ($settings['show_repeat_rule'] == 'show') {
      $summary[] = t('Show repeat rule');
    }
    else {
      $summary[] = t('Hide repeat rule');
    }
  }
}
