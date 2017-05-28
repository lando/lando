<?php
/**
 * @file
 * Date forms and form themes and validation.
 *
 * All code used in form editing and processing is in this file,
 * included only during form editing.
 */

/**
 * Implements hook_element_info().
 *
 * Parameters for date form elements, designed to have sane defaults so any
 * or all can be omitted.
 *
 * Fill the element #default_value with a date in datetime format,
 * (YYYY-MM-DD HH:MM:SS), adjusted to the proper local timezone.
 *
 * NOTE - Converting a date stored in the database from UTC to the local zone
 * and converting it back to UTC before storing it is not handled by this
 * element and must be done in pre-form and post-form processing!
 *
 * The date_select element will create a collection of form elements, with a
 * separate select or textfield for each date part. The whole collection will
 * get reformatted back to a date value of the requested type during validation.
 *
 * The date_text element will create a textfield that can contain a whole
 * date or any part of a date as text. The user input value will be re-formatted
 * back into a date value of the requested type during validation.
 *
 * The date_popup element will create two textfields, one for the date and one
 * for the time. The date textfield will include a jQuery popup calendar date
 * picker, and the time textfield uses a jQuery timepicker.
 *
 * The date_timezone element will create a drop-down selector to pick a
 * timezone name.
 *
 * The date_year_range element will create two textfields (for users with
 * JavaScript enabled they will appear as drop-down selectors with an option
 * for custom text entry) to pick a range of years that will be passed to form
 * submit handlers as a single string (e.g., -3:+3).
 *
 * The date_combo element will create a 'start' and optional 'end' date, along
 * with an optional 'timezone' column for date-specific timezones. Each
 * 'start' and 'end' date will be constructed from date_select or date_text.
 *
 * #date_timezone
 *   The local timezone to be used to create this date.
 *
 * #date_format
 *   A format string that describes the format and order of date parts to
 *   display in the edit form for this element. This makes it possible
 *   to show date parts in a custom order, or to leave some of them out.
 *   Be sure to add 'A' or 'a' to get an am/pm selector. Defaults to the
 *   short site default format.
 *
 * #date_label_position
 *   Handling option for date part labels, like 'Year', 'Month', and 'Day',
 *   can be 'above' the date part, 'within' it, or 'none', default is 'above' .
 *   The 'within' option shows the label as the first option in a select list
 *   or the default value for an empty textfield, taking up less screen space.
 *
 * #date_increment
 *   Increment minutes and seconds by this amount, default is 1.
 *
 * #date_year_range
 *   The number of years to go back and forward in a year selector,
 *   default is -3:+3 (3 back and 3 forward).
 *
 * #date_text_parts
 *   Array of date parts that should use textfields instead of selects
 *   i.e. array('year') will format the year as a textfield and other
 *   date parts as drop-down selects.
 *
 * Additionally, the date_popup element supports the additional properties:
 *
 * #datepicker_options
 *   An associative array representing the jQuery datepicker options you want
 *   to set for this element. Use the jQuery datepicker option names as keys.
 *   Defaults include:
 *   - changeMonth => TRUE
 *   - changeYear => TRUE
 *   - autoPopUp => 'focus'
 *   - closeAtTop => FALSE
 *   - speed => 'immediate'
 */
function _date_element_info() {
  $date_base = array(
    '#input' => TRUE,
    '#tree' => TRUE,
    '#date_timezone' => date_default_timezone(),
    '#date_flexible' => 0,
    '#date_format' => system_date_format_load('short'),
    '#date_text_parts' => array(),
    '#date_increment' => 1,
    '#date_year_range' => '-3:+3',
    '#date_label_position' => 'above',
  );
  $type['date_select'] = array(
    '#process' => array('date_select_element_process'),
    '#theme_wrappers' => array('date_select'),
    '#value_callback' => 'date_select_element_value_callback',
  ) + $date_base;
  $type['date_text'] = array(
    '#process' => array('date_text_element_process'),
    '#theme_wrappers' => array('date_text'),
    '#value_callback' => 'date_text_element_value_callback',
  ) + $date_base;
  $type['date_popup'] = array(
    '#datepicker_options' => array(),
    '#timepicker' => TRUE,
    '#process' => array('date_popup_element_process'),
    '#value_callback' => 'date_popup_element_value_callback',
    '#theme_wrappers' => array('date_popup'),
    ) + $date_base;
  $type['date_timezone'] = array(
    '#input' => TRUE,
    '#tree' => TRUE,
    '#process' => array('date_timezone_element_process'),
    '#theme_wrappers' => array('date_text'),
    '#value_callback' => 'date_timezone_element_value_callback',
  );
  $type['date_year_range'] = array(
    '#input' => TRUE,
    '#process' => array('date_year_range_element_process'),
    '#value_callback' => 'date_year_range_element_value_callback',
    '#element_validate' => array('date_year_range_validate'),
  );
  $type['date_combo'] = array(
    '#input' => TRUE,
    '#delta' => 0,
    '#columns' => array('value', 'value2', 'timezone', 'offset', 'offset2'),
    '#process' => array('date_combo_element_process'),
    '#element_validate' => array('date_combo_validate'),
    '#theme_wrappers' => array('date_combo'),
  );
  return $type;
}

/**
 * Create a date object from a datetime string value.
 */
function date_default_date($element) {
  $granularity = date_format_order($element['#date_format']);
  $default_value = $element['#default_value'];
  $format = DATE_FORMAT_DATETIME;

  // The text and popup widgets might return less than a full datetime string.
  if (strlen($element['#default_value']) < 19) {
    switch (strlen($element['#default_value'])) {
      case 16:
        $format = 'Y-m-d H:i';
        break;

      case 13:
        $format = 'Y-m-d H';
        break;

      case 10:
        $format = 'Y-m-d';
        break;

      case 7:
        $format = 'Y-m';
        break;

      case 4:
        $format = 'Y';
        break;
    }
  }
  $date = new BackdropDateTime($default_value, $element['#date_timezone'], $format);
  if (is_object($date)) {
    $date->limitGranularity($granularity);
    if ($date->validGranularity($granularity, $element['#date_flexible'])) {
      date_increment_round($date, $element['#date_increment']);
    }
    return $date;
  }
  return NULL;
}

/**
 * Process callback which creates a date_year_range form element.
 */
function date_year_range_element_process($element, &$form_state, $form) {
  // Year range is stored in the -3:+3 format, but collected as two separate
  // textfields.
  $element['years_back'] = array(
    '#type' => 'textfield',
    '#title' => t('Starting year'),
    '#default_value' => $element['#value']['years_back'],
    '#size' => 10,
    '#maxsize' => 10,
    '#attributes' => array('class' => array('select-list-with-custom-option', 'back')),
    '#description' => t('Enter a relative value (-9, +9) or an absolute year such as 2015.'),
  );
  $element['years_forward'] = array(
    '#type' => 'textfield',
    '#title' => t('Ending year'),
    '#default_value' => $element['#value']['years_forward'],
    '#size' => 10,
    '#maxsize' => 10,
    '#attributes' => array('class' => array('select-list-with-custom-option', 'forward')),
    '#description' => t('Enter a relative value (-9, +9) or an absolute year such as 2015.'),
  );

  $element['#tree'] = TRUE;
  $element['#attached']['js'][] = backdrop_get_path('module', 'date') . '/js/date-year-range.js';

  $context = array(
    'form' => $form,
  );
  backdrop_alter('date_year_range_process', $element, $form_state, $context);

  return $element;
}

/**
 * Element value callback for the date_year_range form element.
 */
function date_year_range_element_value_callback($element, $input = FALSE, &$form_state = array()) {
  // Convert the element's default value from a string to an array (to match
  // what we will get from the two textfields when the form is submitted).
  if ($input === FALSE) {
    list($years_back, $years_forward) = explode(':', $element['#default_value']);
    return array(
      'years_back' => $years_back,
      'years_forward' => $years_forward,
    );
  }
  return NULL;
}

/**
 * Element validation function for the date_year_range form element.
 */
function date_year_range_validate(&$element, &$form_state) {
  // Recombine the two submitted form values into the -3:+3 format we will
  // validate and save.
  $year_range_submitted = backdrop_array_get_nested_value($form_state['values'], $element['#parents']);
  $year_range = $year_range_submitted['years_back'] . ':' . $year_range_submitted['years_forward'];
  backdrop_array_set_nested_value($form_state['values'], $element['#parents'], $year_range);
  if (!date_range_valid($year_range)) {
    form_error($element['years_back'], t('Starting year must be in the format -9, or an absolute year such as 1980.'));
    form_error($element['years_forward'], t('Ending year must be in the format +9, or an absolute year such as 2030.'));
  }
}

/**
 * Element value callback for date_timezone element.
 */
function date_timezone_element_value_callback($element, $input = FALSE, &$form_state = array()) {
  $return = '';
  if ($input !== FALSE) {
    $return = $input;
  }
  elseif (!empty($element['#default_value'])) {
    $return = array('timezone' => $element['#default_value']);
  }
  return $return;
}

/**
 * Creates a timezone form element.
 *
 * @param array $element
 *   The timezone form element.
 *
 * @return array
 *   the timezone form element
 */
function date_timezone_element_process($element, &$form_state, $form) {
  if (date_hidden_element($element)) {
    return $element;
  }

  $element['#tree'] = TRUE;
  $element['timezone'] = array(
    '#type' => 'select',
    '#title' => t('Timezone'),
    '#title_display' => $element['#date_label_position'] == 'above' ? 'before' : 'invisible',
    '#options' => date_timezone_names($element['#required']),
    '#value' => $element['#value'],
    '#weight' => $element['#weight'],
    '#required' => $element['#required'],
    '#theme' => 'date_select_element',
    '#theme_wrappers' => array('form_element'),
  );
  if (isset($element['#element_validate'])) {
    array_push($element['#element_validate'], 'date_timezone_validate');
  }
  else {
    $element['#element_validate'] = array('date_timezone_validate');
  }

  $context = array(
    'form' => $form,
  );
  backdrop_alter('date_timezone_process', $element, $form_state, $context);

  return $element;
}

/**
 * Validation for timezone input.
 *
 *  Move the timezone value from the nested field back to the original field.
 */
function date_timezone_validate($element, &$form_state) {
  if (date_hidden_element($element)) {
    return;
  }

  form_set_value($element, $element['#value']['timezone'], $form_state);
}

/**
 * Element value callback for date_text element.
 */
function date_text_element_value_callback($element, $input = FALSE, &$form_state = array()) {
  $return = array('date' => '');
  $date = NULL;

  // Normal input from submitting the form element.
  // Check is_array() to skip the string input values created by Views pagers.
  // Those string values, if present, should be interpreted as empty input.
  if ($input != FALSE && is_array($input)) {
    $return = $input;
    $date = date_text_input_date($element, $input);
  }
  // No input? Try the default value.
  elseif (!empty($element['#default_value'])) {
    $date = date_default_date($element);
  }
  if (date_is_date($date)) {
    $return['date'] = date_format_date($date, 'custom', $element['#date_format']);
  }
  return $return;
}

/**
 * Text date input form.
 *
 * Display all or part of a date in a single textfield.
 *
 * The exact parts displayed in the field are those in #date_granularity.
 * The display of each part comes from #date_format.
 */
function date_text_element_process($element, &$form_state, $form) {
  if (date_hidden_element($element)) {
    return $element;
  }

  $element['#tree'] = TRUE;
  $element['#theme_wrappers'] = array('date_text');
  $element['date']['#value'] = $element['#value']['date'];
  $element['date']['#type'] = 'textfield';
  $element['date']['#weight'] = !empty($element['date']['#weight']) ? $element['date']['#weight'] : $element['#weight'];
  $element['date']['#attributes'] = array('class' => isset($element['#attributes']['class']) ? $element['#attributes']['class'] += array('date-date') : array('date-date'));
  $element['date']['#description'] = ' ' . t('Format: @date', array('@date' => date_format_date(date_example_date(), 'custom', $element['#date_format'])));
  $element['date']['#ajax'] = !empty($element['#ajax']) ? $element['#ajax'] : FALSE;
  $element['date']['#title_display'] = $element['#date_label_position'] == 'above' ? 'before' : 'invisible';

  // Make changes if instance is set to be rendered as a regular field.
  if (empty($element['#date_title_printed'])) {
    $element['date']['#title'] = $element['#title'];
    $element['date']['#title_display'] = 'before';
    $element['#date_title_printed'] = TRUE;
  }

  // Always remove the title from the parent element.
  $element['#title'] = NULL;

  // Keep the system from creating an error message for the sub-element.
  // We'll set our own message on the parent element.
  if (isset($element['#element_validate'])) {
    array_push($element['#element_validate'], 'date_text_validate');
  }
  else {
    $element['#element_validate'] = array('date_text_validate');
  }
  if (!empty($element['#force_value'])) {
    $element['date']['#value'] = $element['date']['#default_value'];
  }

  $context = array(
    'form' => $form,
  );
  backdrop_alter('date_text_process', $element, $form_state, $context);

  return $element;
}

/**
 * Validation for text input.
 *
 * When used as a Views widget, the validation step always gets triggered,
 * even with no form submission. Before form submission $element['#value']
 * contains a string, after submission it contains an array.
 */
function date_text_validate($element, &$form_state) {
  if (date_hidden_element($element)) {
    return;
  }

  if (is_string($element['#value'])) {
    return;
  }
  $input_exists = NULL;
  $input = backdrop_array_get_nested_value($form_state['values'], $element['#parents'], $input_exists);

  // Trim extra spacing off user input of text fields.
  if (isset($input['date'])) {
    $input['date'] = trim($input['date']);
  }

  backdrop_alter('date_text_pre_validate', $element, $form_state, $input);

  $label = !empty($element['#date_title']) ? $element['#date_title'] : (!empty($element['#title']) ? $element['#title'] : '');
  $date = date_text_input_date($element, $input);

  // If the field has errors, display them.
  // If something was input but there is no date, the date is invalid.
  // If the field is empty and required, set error message and return.
  $error_field = implode('][', $element['#parents']);
  if (empty($date) || !empty($date->errors)) {
    if (is_object($date) && !empty($date->errors)) {
      if (count($date->errors) === 1) {
        $error_list = ' ' . reset($date->errors);
      }
      else {
        $error_list = theme('item_list', array('items' => $date->errors));
      }
      $message = t('The value input for field %field is invalid:', array('%field' => $label)) . $error_list;
      form_set_error($error_field, $message);
      return;
    }
    if (!empty($element['#required'])) {
      $message = t('A valid date is required for %title.', array('%title' => $label));
      form_set_error($error_field, $message);
      return;
    }
    // Fall through, some other error.
    if (!empty($input['date'])) {
      form_error($element, t('%title is invalid.', array('%title' => $label)));
      return;
    }
  }
  $value = !empty($date) ? $date->format(DATE_FORMAT_DATETIME) : NULL;
  form_set_value($element, $value, $form_state);
}

/**
 * Helper function for creating a date object out of user input.
 */
function date_text_input_date($element, $input) {
  if (empty($input) || !is_array($input) || !array_key_exists('date', $input) || empty($input['date'])) {
    return NULL;
  }
  $granularity = date_format_order($element['#date_format']);

  $date = new BackdropDateTime($input['date'], $element['#date_timezone'], $element['#date_format']);

  if (is_object($date)) {
    $date->limitGranularity($granularity);
    if ($date->validGranularity($granularity, $element['#date_flexible'])) {
      date_increment_round($date, $element['#date_increment']);
    }
    return $date;
  }
  return NULL;
}

/**
 * Element value callback for date_select element.
 */
function date_select_element_value_callback($element, $input = FALSE, &$form_state = array()) {
  $return = array(
    'year' => '',
    'month' => '',
    'day' => '',
    'hour' => '',
    'minute' => '',
    'second' => '',
  );
  $date = NULL;
  if ($input !== FALSE) {
    $return = $input;
    $date = date_select_input_date($element, $input);
  }
  elseif (!empty($element['#default_value'])) {
    $date = date_default_date($element);
  }
  $granularity = date_format_order($element['#date_format']);
  $formats = array(
    'year' => 'Y',
    'month' => 'n',
    'day' => 'j',
    'hour' => 'H',
    'minute' => 'i',
    'second' => 's',
  );
  foreach ($granularity as $field) {
    if ($field != 'timezone') {
      $return[$field] = date_is_date($date) ? $date->format($formats[$field]) : '';
    }
  }
  return $return;
}

/**
 * Flexible date/time drop-down selector.
 *
 * Splits date into a collection of date and time sub-elements, one
 * for each date part. Each sub-element can be either a textfield or a
 * select, based on the value of ['#date_settings']['text_fields'].
 *
 * The exact parts displayed in the field are those in #date_granularity.
 * The display of each part comes from ['#date_settings']['format'].
 */
function date_select_element_process($element, &$form_state, $form) {
  if (date_hidden_element($element)) {
    return $element;
  }

  $date = NULL;
  if (is_array($element['#default_value'])) {
    $date = date_select_input_date($element, $element['#default_value']);
  }
  elseif (!empty($element['#default_value'])) {
    $date = date_default_date($element);
  }

  $element['#tree'] = TRUE;
  $element['#theme_wrappers'] = array('date_select');
  $element['#attached']['css'][] = backdrop_get_path('module', 'date') . '/css/date.css';
  $element += (array) date_parts_element($element, $date, $element['#date_format']);

  // Store a hidden value for all date parts not in the current display.
  $granularity = date_format_order($element['#date_format']);
  foreach (date_nongranularity($granularity) as $field) {
    if ($field != 'timezone') {
      $element[$field] = array(
        '#type' => 'value',
        '#value' => 0,
      );
    }
  }
  if (isset($element['#element_validate'])) {
    array_push($element['#element_validate'], 'date_select_validate');
  }
  else {
    $element['#element_validate'] = array('date_select_validate');
  }

  $context = array(
    'form' => $form,
  );
  backdrop_alter('date_select_process', $element, $form_state, $context);

  return $element;
}

/**
 * Creates form elements for one or more date parts.
 *
 * Get the order of date elements from the provided format.
 * If the format order omits any date parts in the granularity, alter the
 * granularity array to match the format, then flip the $order array
 * to get the position for each element. Then iterate through the
 * elements and create a sub-form for each part.
 *
 * @param array $element
 *   The date element.
 * @param object $date
 *   The date object.
 * @param string $format
 *   A date format string.
 *
 * @return array
 *   The form array for the submitted date parts.
 */
function date_parts_element($element, $date, $format) {
  $granularity = date_format_order($format);
  $sub_element = array('#granularity' => $granularity);
  $order = array_flip($granularity);

  $hours_format  = strpos(strtolower($element['#date_format']), 'a') ? 'g' : 'G';
  $month_function  = strpos($element['#date_format'], 'F') !== FALSE ? 'date_month_names' : 'date_month_names_abbr';

  // Allow empty value as option if date is not required or there is no date.
  $part_required = (bool) $element['#required'] && is_object($date);
  foreach ($granularity as $field) {
    $part_type = in_array($field, $element['#date_text_parts']) ? 'textfield' : 'select';
    $sub_element[$field] = array(
      '#weight' => $order[$field],
      '#required' => $part_required,
      '#attributes' => array('class' => isset($element['#attributes']['class']) ? $element['#attributes']['class'] += array('date-' . $field) : array('date-' . $field)),
      '#ajax' => !empty($element['#ajax']) ? $element['#ajax'] : FALSE,
    );
    switch ($field) {
      case 'year':
        $range = date_range_years($element['#date_year_range'], $date);
        $start_year = $range[0];
        $end_year = $range[1];

        $sub_element[$field]['#title'] = t('Year');
        $sub_element[$field]['#default_value'] = is_object($date) ? $date->format('Y') : '';
        if ($part_type == 'select') {
          $sub_element[$field]['#options'] = backdrop_map_assoc(date_years($start_year, $end_year, $part_required));
        }
        break;

      case 'month':
        $sub_element[$field]['#title'] = t('Month');
        $sub_element[$field]['#default_value'] = is_object($date) ? $date->format('n') : '';
        if ($part_type == 'select') {
          $sub_element[$field]['#options'] = $month_function($part_required);
        }
        break;

      case 'day':
        $sub_element[$field]['#title'] = t('Day');
        $sub_element[$field]['#default_value'] = is_object($date) ? $date->format('j') : '';
        if ($part_type == 'select') {
          $sub_element[$field]['#options'] = backdrop_map_assoc(date_days($part_required));
        }
        break;

      case 'hour':
        $sub_element[$field]['#title'] = t('Hour');
        $sub_element[$field]['#default_value'] = is_object($date) ? $date->format($hours_format) : '';
        if ($part_type == 'select') {
          $sub_element[$field]['#options'] = backdrop_map_assoc(date_hours($hours_format, $part_required));
        }
        if ($element['#date_label_position'] != 'above') {
          $sub_element[$field]['#prefix'] = '<span class="date-spacer date-parts-spacer">-</span>';
        }
        break;

      case 'minute':
        $sub_element[$field]['#title'] = t('Minute');
        $sub_element[$field]['#default_value'] = is_object($date) ? $date->format('i') : '';
        if ($part_type == 'select') {
          $sub_element[$field]['#options'] = backdrop_map_assoc(date_minutes('i', $part_required, $element['#date_increment']));
        }
        if ($element['#date_label_position'] != 'above') {
          $sub_element[$field]['#prefix'] = '<span class="date-spacer date-time-spacer">:</span>';
        }
        break;

      case 'second':
        $sub_element[$field]['#title'] = t('Second');
        $sub_element[$field]['#default_value'] = is_object($date) ? $date->format('s') : '';
        if ($part_type == 'select') {
          $sub_element[$field]['#options'] = backdrop_map_assoc(date_seconds('s', $part_required, $element['#date_increment']));
        }
        if ($element['#date_label_position'] != 'above') {
          $sub_element[$field]['#prefix'] = '<span class="date-spacer">:</span>';
        }
        break;
    }

    // Add handling for the date part label.
    $label = $sub_element[$field]['#title'];
    if (in_array($field, $element['#date_text_parts'])) {
      $sub_element[$field]['#type'] = 'textfield';
      $sub_element[$field]['#theme'] = 'date_textfield_element';
      $sub_element[$field]['#size'] = 7;
      $sub_element[$field]['#title_display'] = in_array($element['#date_label_position'], array('within', 'none')) ? 'invisible' : 'before';
      if ($element['#date_label_position'] == 'within') {
        if (!empty($sub_element[$field]['#options']) && is_array($sub_element[$field]['#options'])) {
          $sub_element[$field]['#options'] = array('' => $label) + $sub_element[$field]['#options'];
        }
      }
    }
    else {
      $sub_element[$field]['#type'] = 'select';
      $sub_element[$field]['#theme'] = 'date_select_element';
      $sub_element[$field]['#title_display'] = in_array($element['#date_label_position'], array('within', 'none')) ? 'invisible' : 'before';
      if ($element['#date_label_position'] == 'within') {
        $sub_element[$field]['#options'] = array('' => $label) + $sub_element[$field]['#options'];
      }
    }

    // Views exposed filters are treated as submitted even if not,
    // so force the #default value in that case. Make sure we set
    // a default that is in the option list.
    if (!empty($element['#force_value']) && isset($sub_element[$field]['#options'])) {
      $options = $sub_element[$field]['#options'];
      $default = !empty($sub_element[$field]['#default_value']) ? $sub_element[$field]['#default_value'] : array_shift($options);
      $sub_element[$field]['#value'] = $default;
    }
  }

  if (($hours_format == 'g' || $hours_format == 'h') && date_has_time($granularity)) {
    $label = '&nbsp;';
    $sub_element['ampm'] = array(
      '#type' => 'select',
      '#theme' => 'date_select_element',
      '#title' => $label,
      '#title_display' => in_array($element['#date_label_position'], array('within', 'none')) ? 'invisible' : 'before',
      '#default_value' => is_object($date) ? (date_format($date, 'G') >= 12 ? 'pm' : 'am') : '',
      '#options' => backdrop_map_assoc(date_ampm($part_required)),
      '#required' => $part_required,
      '#weight' => 8,
      '#attributes' => array('class' => array('date-ampm')),
    );
  }

  return $sub_element;
}

/**
 * Validation function for date selector.
 *
 * When used as a Views widget, the validation step always gets triggered,
 * even with no form submission. Before form submission $element['#value']
 * contains a string, after submission it contains an array.
 */
function date_select_validate($element, &$form_state) {
  if (date_hidden_element($element)) {
    return;
  }

  if (is_string($element['#value'])) {
    return;
  }

  $input_exists = NULL;
  $input = backdrop_array_get_nested_value($form_state['values'], $element['#parents'], $input_exists);
  backdrop_alter('date_select_pre_validate', $element, $form_state, $input);

  $label = !empty($element['#date_title']) ? $element['#date_title'] : (!empty($element['#title']) ? $element['#title'] : '');
  if (isset($input['ampm'])) {
    if ($input['ampm'] == 'pm' && $input['hour'] < 12) {
      $input['hour'] += 12;
    }
    elseif ($input['ampm'] == 'am' && $input['hour'] == 12) {
      $input['hour'] -= 12;
    }
  }
  unset($input['ampm']);
  $date = date_select_input_date($element, $input);

  // If the field has errors, display them.
  $error_field = implode('][', $element['#parents']);
  $entered = array_values(array_filter($input));
  if (empty($date) || !empty($date->errors)) {
    // The input created a date but it has errors.
    if (is_object($date) && !empty($date->errors)) {
      if (count($date->errors) === 1) {
        $error_list = ' ' . reset($date->errors);
      }
      else {
        $error_list = theme('item_list', array('items' => $date->errors));
      }
      $message = t('The value input for field %field is invalid:', array('%field' => $label)) . $error_list;
      form_set_error($error_field, $message);
      return;
    }
    // Nothing was entered but the date is required.
    elseif (empty($entered) && $element['#required']) {
      $message = t('A valid date is required for %title.', array('%title' => $label));
      form_set_error($error_field, $message);
      return;
    }
    // Something was input but it wasn't enough to create a valid date.
    elseif (!empty($entered)) {
      $message = t('The value input for field %field is invalid.', array('%field' => $label));
      form_set_error($error_field, $message);
      return;
    }
  }
  $value = !empty($date) ? $date->format(DATE_FORMAT_DATETIME) : NULL;
  form_set_value($element, $value, $form_state);
}

/**
 * Helper function for creating a date object out of user input.
 */
function date_select_input_date($element, $input) {
  // Was anything entered? If not, we have no date.
  if (!is_array($input)) {
    return NULL;
  }
  else {
    $entered = array_values(array_filter($input));
    if (empty($entered)) {
      return NULL;
    }
  }
  $granularity = date_format_order($element['#date_format']);
  if (isset($input['ampm'])) {
    if ($input['ampm'] == 'pm' && $input['hour'] < 12) {
      $input['hour'] += 12;
    }
    elseif ($input['ampm'] == 'am' && $input['hour'] == 12) {
      $input['hour'] -= 12;
    }
  }
  unset($input['ampm']);

  // Make the input match the granularity.
  foreach (date_nongranularity($granularity) as $part) {
    unset($input[$part]);
  }

  $date = new BackdropDateTime($input, $element['#date_timezone']);
  if (is_object($date)) {
    $date->limitGranularity($granularity);
    if ($date->validGranularity($granularity, $element['#date_flexible'])) {
      date_increment_round($date, $element['#date_increment']);
    }
    return $date;
  }
  return NULL;
}

/**
 * Create local date object.
 *
 * Create a date object set to local time from the field and
 * widget settings and item values. Default values for new entities
 * are set by the default value callback, so don't need to be accounted for here.
 */
function date_local_date($item, $timezone, $field, $instance, $part = 'value') {

  $value = $item[$part];

  // If the value is empty, don't try to create a date object because it will
  // end up being the current day.
  if (empty($value)) {
    return NULL;
  }

  $date = new BackdropDateTime($value, date_get_timezone_db($field['settings']['tz_handling']));
  $date->limitGranularity($field['settings']['granularity']);
  if (empty($date)) {
    return NULL;
  }
  date_timezone_set($date, timezone_open($timezone));

  return $date;
}

/**
 * The callback for setting a default value for an empty date field.
 */
function date_default_value($field, $instance, $langcode) {
  $item = array();
  $db_format = date_type_format($field['type']);
  $date = date_default_value_part($item, $field, $instance, $langcode, 'value');
  $item[0]['value'] = is_object($date) ? date_format($date, $db_format) : '';
  if (!empty($field['settings']['todate'])) {
    $date = date_default_value_part($item, $field, $instance, $langcode, 'value2');
    $item[0]['value2'] = is_object($date) ? date_format($date, $db_format) : '';
  }

  // Make sure the default value has the same construct as a loaded field value
  // to avoid errors if the default value is used on a hidden element.
  $item[0]['timezone'] = date_get_timezone($field['settings']['tz_handling']);
  $item[0]['timezone_db'] = date_get_timezone_db($field['settings']['tz_handling']);
  $item[0]['date_type'] = $field['type'];
  if (!isset($item[0]['value2'])) {
    $item[0]['value2'] = $item[0]['value'];
  }
  return $item;
}

/**
 * Helper function for the date default value callback to set either 'value' or 'value2' to its default value.
 */
function date_default_value_part($item, $field, $instance, $langcode, $part = 'value') {
  $timezone = date_get_timezone($field['settings']['tz_handling']);
  $timezone_db = date_get_timezone_db($field['settings']['tz_handling']);
  $date = NULL;
  if ($part == 'value') {
    $default_value = $instance['settings']['default_value'];
    $default_value_code = $instance['settings']['default_value_code'];
  }
  else {
    $default_value = $instance['settings']['default_value2'];
    $default_value_code = $instance['settings']['default_value_code2'];
  }
  if (empty($default_value) || $default_value == 'blank') {
    return NULL;
  }
  elseif ($default_value == 'strtotime' && !empty($default_value_code)) {
    $date = new BackdropDateTime($default_value_code, date_default_timezone());
  }
  elseif ($part == 'value2' && $default_value == 'same') {
    if ($instance['settings']['default_value'] == 'blank' || empty($item[0]['value'])) {
      return NULL;
    }
    else {
      // The date stored in 'value' has already been switched to the db timezone.
      $date = new BackdropDateTime($item[0]['value'], $timezone_db, DATE_FORMAT_DATETIME);
    }
  }
  // Special case for 'now' when using dates with no timezone,
  // make sure 'now' isn't adjusted to UTC value of 'now' .
  elseif ($field['settings']['tz_handling'] == 'none') {
    $date = date_now();
  }
  else {
    $date = date_now($timezone);
  }
  // The default value needs to be in the database timezone.
  date_timezone_set($date, timezone_open($timezone_db));
  $date->limitGranularity($field['settings']['granularity']);
  return $date;
}


/**
 * Element value callback for date_popup element.
 */
function date_popup_element_value_callback($element, $input = FALSE, &$form_state) {
  $granularity = date_format_order($element['#date_format']);
  $has_time = date_has_time($granularity);
  $date = NULL;
  $return = $has_time ? array('date' => '', 'time' => '') : array('date' => '');
  // Normal input from submitting the form element.
  // Check is_array() to skip the string input values created by Views pagers.
  // Those string values, if present, should be interpreted as empty input.
  if ($input !== FALSE && is_array($input)) {
    $return = $input;
    $date = date_popup_input_date($element, $input);
  }
  // No input? Try the default value.
  elseif (!empty($element['#default_value'])) {
    $date = date_default_date($element);
  }
  // Date with errors won't re-display.
  if (date_is_date($date)) {
    $return['date'] = !$date->timeOnly ? date_format_date($date, 'custom', _date_popup_date_format($element)) : '';
    $return['time'] = $has_time ? date_format_date($date, 'custom', _date_popup_time_format($element)) : '';
  }
  elseif (!empty($input)) {
    $return = $input;
  }
  return $return;

}

/**
 * Javascript popup element processing.
 *
 * Add popup attributes to $element.
 */
function date_popup_element_process($element, &$form_state, $form) {
  if (date_hidden_element($element)) {
    return $element;
  }

  module_load_include('inc', 'date', 'date.elements');

  $element['#tree'] = TRUE;
  $element['#theme_wrappers'] = array('date_popup');
  $element['#attached']['library'][] = array('date_popup', 'date_popup');

  if (!empty($element['#ajax'])) {
    $element['#ajax'] += array(
      'trigger_as' => array(
        'name' => $element['#name'],
      ),
      'event' => 'change',
    );
  }

  $element['date'] = _date_popup_process_date_part($element);
  $element['time'] = _date_popup_process_time_part($element);

  // If
  if (empty($element['#date_title_printed'])) {
    // Both date and time exist.
    if (!empty($element['date']) && !empty($element['time'])) {
      $element['date']['#title'] = $element['#title'];
      $element['date']['#title_display'] = $element['#title_display'];
      $element['date']['#required'] = $element['#required'];
    }
    // Only date exists.
    elseif (!empty($element['date']) && empty($element['time'])) {
      $element['date']['#title'] = $element['#title'];
      $element['date']['#title_display'] = $element['#title_display'];
      $element['date']['#required'] = $element['#required'];
    }
    // Only time exists.
    elseif (empty($element['date']) && !empty($element['time'])) {
      $element['time']['#title'] = $element['#title'];
      $element['time']['#title_display'] = $element['#title_display'];
      $element['time']['#required'] = $element['#required'];
    }

  }

  // Remove the title from the overall element.
  $element['#title'] = NULL;

  if (isset($element['#element_validate'])) {
    array_push($element['#element_validate'], 'date_popup_validate');
  }
  else {
    $element['#element_validate'] = array('date_popup_validate');
  }

  $context = array(
    'form' => $form,
  );
  backdrop_alter('date_popup_process', $element, $form_state, $context);

  return $element;
}

/**
 * Process the date portion of the element.
 */
function _date_popup_process_date_part(&$element) {
  $date_granularity = _date_popup_date_granularity($element);
  if (empty($date_granularity)) {
    return array();
  }

  // When used as a Views exposed filter widget, $element['#value'] contains an
  // array instead an string. Fill the 'date' string in this case.
  $mock = NULL;
  $callback_values = date_popup_element_value_callback($element, FALSE, $mock);
  if (!isset($element['#value']['date']) && isset($callback_values['date'])) {
    $element['#value']['date'] = $callback_values['date'];
  }

  // The datepicker can't handle zero or negative values like 0:+1
  // even though the Date API can handle them, so rework the value
  // we pass to the datepicker to use defaults it can accept (such as +0:+1)
  // date_range_string() adds the necessary +/- signs to the range string.
  $date = '';
  if (!empty($element['#value']['date'])) {
    $date = new BackdropDateTime($element['#value']['date'], $element['#date_timezone'], _date_popup_date_format($element));
  }
  $range = date_range_years($element['#date_year_range'], $date);
  $year_range = date_range_string($range);

  // Add the dynamic datepicker options. Allow element-specific datepicker
  // preferences to override these options for whatever reason they see fit.
  $settings = $element['#datepicker_options'] + array(
    'changeMonth' => TRUE,
    'changeYear' => TRUE,
    'autoPopUp' => 'focus',
    'closeAtTop' => FALSE,
    'speed' => 'immediate',
    'firstDay' => intval(config_get('system.date','first_day')),
    'dateFormat' => _date_popup_format_to_popup(_date_popup_date_format($element)),
    'yearRange' => $year_range,
  );

  // Make sure that any defaultDate is within the yearRange.
  if (!empty($settings['yearRange'])) {
    $parts = explode(':', $settings['yearRange']);
    // Set the default date to 0 or the lowest bound if
    // the date ranges do not include the current year.
    // Necessary for the datepicker to render and select dates correctly.
    $default_date = ($parts[0] > 0 || 0 > $parts[1]) ? $parts[0] : 0;
    $settings += array('defaultDate' => (string) $default_date . 'y');
  }

  // Manually build this element and set the value -
  // this will prevent corrupting the parent value.
  $parents = array_merge($element['#parents'], array('date'));
  $sub_element = array(
    '#type' => 'textfield',
    '#title' => $element['#title'],
    '#title_display' => $element['#date_label_position'] == 'above' ? 'before' : 'invisible',
    '#default_value' => date_format_date($date, 'custom', _date_popup_date_format($element)),
    '#input' => FALSE,
    '#size' => !empty($element['#size']) ? $element['#size'] : 20,
    '#maxlength' => !empty($element['#maxlength']) ? $element['#maxlength'] : 30,
    '#attributes' => $element['#attributes'] + array('data-date-popup' => json_encode($settings)),
    '#parents' => $parents,
    '#name' => array_shift($parents) . '[' . implode('][', $parents) . ']',
    '#ajax' => !empty($element['#ajax']) ? $element['#ajax'] : FALSE,
    '#attached' => array('library' => array(
      array('system', 'ui.datepicker')
    )),
  );
  $sub_element['#value'] = $sub_element['#default_value'];

  // Add an example placeholder to the date field.
  if (!isset($sub_element['#attributes']['placeholder'])) {
    $sub_element['#attributes']['placeholder'] = t('e.g. @date', array(
      '@date' => date_format_date(
        date_example_date(),
        'custom',
        _date_popup_date_format($element)
        ),
      )
    );
  }

  return $sub_element;
}

/**
 * Process the time portion of the element.
 */
function _date_popup_process_time_part(&$element) {
  $granularity = date_format_order($element['#date_format']);
  $has_time = date_has_time($granularity);
  if (empty($has_time)) {
    return array();
  }

  // When used as a Views exposed filter widget, $element['#value'] contains an
  // array instead an string. Fill the 'time' string in this case.
  $mock = NULL;
  $callback_values = date_popup_element_value_callback($element, FALSE, $mock);
  if (!isset($element['#value']['time']) && isset($callback_values['time'])) {
    $element['#value']['time'] = $callback_values['time'];
  }

  // Manually build this element and set the value -
  // this will prevent corrupting the parent value.
  $parents = array_merge($element['#parents'], array('time'));
  $sub_element = array(
    '#type' => 'textfield',
    '#title' => isset($element['#title']) ? t('Time for @label', array('@label' => $element['#title'])) : t('Time'),
    '#title_display' => 'invisible',
    '#default_value' => $element['#value']['time'],
    '#size' => 15,
    '#maxlength' => 10,
    '#parents' => $parents,
    '#name' => array_shift($parents) . '[' . implode('][', $parents) . ']',
    '#ajax' => !empty($element['#ajax']) ? $element['#ajax'] : FALSE,
    '#attached' => array('library' => array(
      array('system', 'jquery.timeentry')
    )),
    '#attributes' => $element['#attributes'],
  );

  $sub_element['#value'] = $sub_element['#default_value'];

  // Add a placeholder sample text to the time field.
  if (!isset($sub_element['#attributes']['placeholder'])) {
    $example_date = date_now();
    date_increment_round($example_date, $element['#date_increment']);
    $sub_element['#attributes']['placeholder'] = t('e.g. @date', array(
      '@date' => date_format_date(
        $example_date,
        'custom',
        _date_popup_time_format($element)
      )));
  }

  // Add in the timepicker if set.
  if ($element['#timepicker']) {
    $settings = array(
      'show24Hours' => strpos($element['#date_format'], 'H') !== FALSE ? TRUE : FALSE,
      'showSeconds' => (in_array('second', $granularity) ? TRUE : FALSE),
      'timeSteps' => array(1, intval($element['#date_increment']), (in_array('second', $granularity) ? $element['#date_increment'] : 0)),
      'fromTo' => isset($fromto),
      'spinnerImage' => '',
    );
    // Determine if we are using lowercase or uppercase am/pm and translate.
    if (strpos($element['#date_format'], 'a') !== FALSE) {
      $settings['ampmNames'] = array(t('am'), t('pm'));
    }
    else {
      $settings['ampmNames'] = array(t('AM'), t('PM'));
    }
    // Determine if we should have a leading space before the am/pm.
    if (strpos($element['#date_format'], ' A') !== FALSE || strpos($element['#date_format'], ' a') !== FALSE) {
      $settings['ampmPrefix'] = ' ';
    }
    $sub_element['#attributes'] += array('data-timeentry' => json_encode($settings));
  }

  return ($sub_element);
}

/**
 * Massage the input values back into a single date.
 *
 * When used as a Views widget, the validation step always gets triggered,
 * even with no form submission. Before form submission $element['#value']
 * contains a string, after submission it contains an array.
 */
function date_popup_validate($element, &$form_state) {
  if (date_hidden_element($element)) {
    return;
  }
  if (is_string($element['#value'])) {
    return;
  }

  module_load_include('inc', 'date', 'date.elements');
  $input_exists = NULL;
  $input = backdrop_array_get_nested_value($form_state['values'], $element['#parents'], $input_exists);
  // If the date is a string, it is not considered valid and can cause problems
  // later on, so just exit out now.
  if (is_string($input)) {
    return;
  }

  backdrop_alter('date_popup_pre_validate', $element, $form_state, $input);

  $label = '';
  if (!empty($element['#date_title'])) {
    $label = t($element['#date_title']);
  }
  elseif (!empty($element['#title'])) {
    $label = t($element['#title']);
  }
  $date = date_popup_input_date($element, $input);

  // If the date has errors, display them.
  // If something was input but there is no date, the date is invalid.
  // If the field is empty and required, set error message and return.
  $error_field = implode('][', $element['#parents']);
  if (empty($date) || !empty($date->errors)) {
    if (is_object($date) && !empty($date->errors)) {
      $message = t('The value input for field %field is invalid:', array('%field' => $label));
      $message .= count($date->errors) ? (' ' . implode('', $date->errors)) : ('<br />' . implode('<br />', $date->errors));
      form_set_error($error_field, $message);
      return;
    }
    if (!empty($input['date'])) {
      $message = t('The value input for field %field is invalid.', array('%field' => $label));
      form_set_error($error_field, $message);
      return;
    }
    if ($element['#required']) {
      $message = t('A valid date is required for %title.', array('%title' => $label));
      form_set_error($error_field, $message);
      return;
    }
  }

  // If the created date is valid, set it.
  $value = !empty($date) ? $date->format(DATE_FORMAT_DATETIME) : NULL;
  form_set_value($element, $value, $form_state);
}

/**
 * Helper function for extracting a date value out of user input.
 *
 * @param bool $auto_complete
 *   Should we add a time value to complete the date if there is no time?
 *   Useful anytime the time value is optional.
 */
function date_popup_input_date($element, $input, $auto_complete = FALSE) {
  if (empty($input) || !is_array($input) || !array_key_exists('date', $input) || empty($input['date'])) {
    return NULL;
  }
  $granularity = date_format_order($element['#date_format']);
  $has_time = date_has_time($granularity);
  $flexible = !empty($element['#date_flexible']) ? $element['#date_flexible'] : 0;

  $format = _date_popup_date_format($element);
  $format .= $has_time ? ' ' . _date_popup_time_format($element) : '';
  $datetime = trim($input['date']);
  $datetime .= $has_time ? ' ' . trim($input['time']) : '';
  $date = new BackdropDateTime($datetime, $element['#date_timezone'], $format);
  if (is_object($date)) {
    $date->limitGranularity($granularity);
    if ($date->validGranularity($granularity, $flexible)) {
      date_increment_round($date, $element['#date_increment']);
    }
    return $date;
  }
  return NULL;
}

/**
 * Date popup date granularity.
 */
function _date_popup_date_granularity($element) {
  $granularity = date_format_order($element['#date_format']);
  return array_intersect($granularity, array('month', 'day', 'year'));
}

/**
 * Date popup time granularity.
 */
function _date_popup_time_granularity($element) {
  $granularity = date_format_order($element['#date_format']);
  return array_intersect($granularity, array('hour', 'minute', 'second'));
}

/**
 * Date popup date format.
 */
function _date_popup_date_format($element) {
  return (date_limit_format($element['#date_format'], _date_popup_date_granularity($element)));
}

/**
 * Date popup time format.
 */
function _date_popup_time_format($element) {
  return _date_popup_format_to_popup_time(date_limit_format($element['#date_format'], _date_popup_time_granularity($element)));
}

/**
 * Allowable time formats.
 */
function _date_popup_time_formats($with_seconds = FALSE) {
  return array(
    'H:i:s',
    'h:i:sA',
  );
}

/**
 * Recreate a date format string so it has the values popup expects.
 *
 * @param string $format
 *   A normal date format string, like Y-m-d
 *
 * @return string
 *   A format string in popup format, like YMD-, for the
 *   earlier 'calendar' version, or m/d/Y for the later 'datepicker'
 *   version.
 */
function _date_popup_format_to_popup($format) {
  if (empty($format)) {
    $format = 'Y-m-d';
  }
  $replace = _date_popup_datepicker_format_replacements();
  return strtr($format, $replace);
}

/**
 * Recreate a time format string so it has the values popup expects.
 *
 * @param string $format
 *   A normal time format string, like h:i (a)
 *
 * @return string
 *   A format string that the popup can accept like h:i a
 */
function _date_popup_format_to_popup_time($format) {
  if (empty($format)) {
    $format = 'H:i';
  }
  $symbols = array(
    '/',
    '-',
    ' .',
    ',',
    'F',
    'M',
    'l',
    'z',
    'w',
    'W',
    'd',
    'j',
    'm',
    'n',
    'y',
    'Y',
  );
  $format = str_replace($symbols, '', $format);
  $format = strtr($format, array('G' => 'H', 'g' => 'h'));
  return $format;
}

/**
 * The format replacement patterns for the new datepicker.
 */
function _date_popup_datepicker_format_replacements() {
  return array(
    'd' => 'dd',
    'j' => 'd',
    'l' => 'DD',
    'D' => 'D',
    'm' => 'mm',
    'n' => 'm',
    'F' => 'MM',
    'M' => 'M',
    'Y' => 'yy',
    'y' => 'y',
  );
}

/**
 * Process an individual date element.
 */
function date_combo_element_process($element, &$form_state, $form) {
  if (date_hidden_element($element)) {
    // A hidden value for a new entity that had its end date set to blank
    // will not get processed later to populate the end date, so set it here.
    if (isset($element['#value']['value2']) && empty($element['#value']['value2'])) {
      $element['#value']['value2'] = $element['#value']['value'];
    }
    return $element;
  }

  $delta = $element['#delta'];
  $date_is_default = $element['#date_is_default'];

  $field = field_widget_field($element, $form_state);
  $instance = field_widget_instance($element, $form_state);

  $from_field = 'value';
  $to_field = 'value2';

  // Convert UTC dates to their local values in DATETIME format,
  // and adjust the default values as specified in the field settings.

  // It would seem to make sense to do this conversion when the data
  // is loaded instead of when the form is created, but the loaded
  // field data is cached and we can't cache dates that have been converted
  // to the timezone of an individual user, so we cache the UTC values
  // instead and do our conversion to local dates in the form and
  // in the formatters.
  $process = date_process_values($field, $instance);
  foreach ($process as $processed) {
    if (!isset($element['#default_value'][$processed])) {
      $element['#default_value'][$processed] = '';
    }
    $date = date_local_date($element['#default_value'], $element['#date_timezone'], $field, $instance, $processed);
    $element['#default_value'][$processed] = is_object($date) ? date_format($date, DATE_FORMAT_DATETIME) : '';
  }

  // Blank out the end date for optional end dates that match the start date,
  // except when this is a new node that has default values that should be honored.
  if (!$date_is_default && $field['settings']['todate'] != 'required'
  && !empty($element['#default_value'][$to_field])
  && $element['#default_value'][$to_field] == $element['#default_value'][$from_field]) {
    unset($element['#default_value'][$to_field]);
  }

  $show_todate = !empty($form_state['values']['show_todate']) || !empty($element['#default_value'][$to_field]) || $field['settings']['todate'] == 'required';
  $element['show_todate'] = array(
    '#title' => t('Show End Date'),
    '#type' => 'checkbox',
    '#default_value' => $show_todate,
    '#weight' => -20,
    '#attributes' => array('data-toggle-todate' => TRUE),
    '#access' => $field['settings']['todate'] == 'optional',
  );

  $element[$from_field] = array(
    '#field'         => $field,
    '#instance'      => $instance,
    '#weight'        => $instance['widget']['weight'],
    '#required'      => ($element['#required'] && $delta == 0) ? 1 : 0,
    '#default_value' => isset($element['#default_value'][$from_field]) ? $element['#default_value'][$from_field] : '',
    '#delta'         => $delta,
    '#date_title'    => $instance['label'],
    '#date_timezone' => $element['#date_timezone'],
    '#date_format'      => date_limit_format(date_input_format($element, $field, $instance), $field['settings']['granularity']),
    '#date_text_parts'  => (array) $instance['widget']['settings']['text_parts'],
    '#date_increment'   => $instance['widget']['settings']['increment'],
    '#date_year_range'  => $instance['widget']['settings']['year_range'],
    '#date_label_position' => $instance['widget']['settings']['label_position'],
  );

  $description = !empty($element['#description']) ? t($element['#description']) : '';
  unset($element['#description']);

  switch ($instance['widget']['type']) {
    case 'date_select':
      $element[$from_field]['#type'] = 'date_select';
      $element[$from_field]['#theme_wrappers'] = array('date_select');
      $element[$from_field]['#ajax'] = !empty($element['#ajax']) ? $element['#ajax'] : FALSE;
      break;

    case 'date_popup':
      $element[$from_field]['#type'] = 'date_popup';
      $element[$from_field]['#theme_wrappers'] = array('date_popup');
      $element[$from_field]['#ajax'] = !empty($element['#ajax']) ? $element['#ajax'] : FALSE;
      break;

    default:
      $element[$from_field]['#type'] = 'date_text';
      $element[$from_field]['#theme_wrappers'] = array('date_text');
      $element[$from_field]['#ajax'] = !empty($element['#ajax']) ? $element['#ajax'] : FALSE;
      break;
  }

  // If this field uses the 'End', add matching element
  // for the 'End' date, and adapt titles to make it clear which
  // is the 'Start' and which is the 'End' .
  if (!empty($field['settings']['todate'])) {
    $element[$to_field] = $element[$from_field];
    $element[$from_field]['#wrapper_attributes']['class'][] = 'start-date-wrapper';
    $element[$to_field]['#wrapper_attributes']['class'][] = 'end-date-wrapper';
    $element[$to_field]['#default_value'] = isset($element['#default_value'][$to_field]) ? $element['#default_value'][$to_field] : '';
    $element[$to_field]['#required'] = ($element[$from_field]['#required'] && $field['settings']['todate'] == 'required');
    $element[$to_field]['#weight'] += .2;
    $element[$to_field]['#prefix'] = '';
    $element[$to_field]['#date_title'] = $instance['label'];
    $element['#attached']['js'][] = backdrop_get_path('module', 'date') . '/js/date-range.js';
  }
  else {
    $element[$from_field]['#description'] = $description;
  }

  // Set labels for each field in a multiple value widget.
  if ($field['cardinality'] != 1) {
    $element[$from_field]['#title'] = t('Date');
    $element[$from_field]['#date_title_printed'] = TRUE;
    if (!empty($field['settings']['todate'])) {
      $element[$from_field]['#title'] = t('Start date');
      $element[$to_field]['#title'] = t('End date');
      $element[$to_field]['#date_title_printed'] = TRUE;
    }
  }
  // Single value with from and to dates.
  elseif (!empty($field['settings']['todate'])) {
    $element[$from_field]['#title'] = t('@field_name start date', array('@field_name' => $instance['label']));
    $element[$from_field]['#date_title_printed'] = $element['#date_title_printed'];
    $element[$to_field]['#title'] = t('@field_name end date', array('@field_name' => $instance['label']));
    $element[$to_field]['#date_title_printed'] = $element['#date_title_printed'];
  }
  // Single value with just a single date.
  else {
    $element[$from_field]['#title'] = check_plain($instance['label']);
    $element[$from_field]['#date_title_printed'] = $element['#date_title_printed'];
  }

  $context = array(
    'field'     => $field,
    'instance'  => $instance,
    'form'      => $form,
  );
  backdrop_alter('date_combo_process', $element, $form_state, $context);

  return $element;
}

/**
 * Empty a date element.
 */
function date_element_empty($element, &$form_state) {
  $item = array();
  $item['value'] = NULL;
  $item['value2']   = NULL;
  $item['timezone']   = NULL;
  $item['offset'] = NULL;
  $item['offset2'] = NULL;
  form_set_value($element, $item, $form_state);
  return $item;
}

/**
 * Validate and update a combo element.
 *
 * Don't try this if there were errors before reaching this point.
 */
function date_combo_validate($element, &$form_state) {
  // Disabled and hidden elements won't have any input and don't need validation,
  // we just need to re-save the original values, from before they were processed into
  // widget arrays and timezone-adjusted.
  if (date_hidden_element($element) || !empty($element['#disabled'])) {
    form_set_value($element, $element['#date_items'], $form_state);
    return;
  }

  $field_name = $element['#field_name'];
  $delta = $element['#delta'];

  // Related issue: https://drupal.org/node/2279831.
  if (!is_array($element['#field_parents'])) {
    $element['#field_parents'] = array();
  }
  $form_values = backdrop_array_get_nested_value($form_state['values'], $element['#field_parents']);
  $form_input = backdrop_array_get_nested_value($form_state['input'], $element['#field_parents']);

  // If the whole field is empty and that's OK, stop now.
  if (empty($form_input[$field_name]) && !$element['#required']) {
    return;
  }

  $item = backdrop_array_get_nested_value($form_state['values'], $element['#parents']);
  $posted = backdrop_array_get_nested_value($form_state['input'], $element['#parents']);

  $field = field_widget_field($element, $form_state);
  $instance = field_widget_instance($element, $form_state);

  $context = array(
    'field' => $field,
    'instance' => $instance,
    'item' => $item,
  );

  backdrop_alter('date_combo_pre_validate', $element, $form_state, $context);

  $from_field = 'value';
  $to_field = 'value2';
  $tz_field = 'timezone';
  $offset_field = 'offset';
  $offset_field2 = 'offset2';

  // Check for empty 'Start date', which could either be an empty
  // value or an array of empty values, depending on the widget.
  $empty = TRUE;
  if (!empty($item[$from_field])) {
    if (!is_array($item[$from_field])) {
      $empty = FALSE;
    }
    else {
      foreach ($item[$from_field] as $key => $value) {
        if (!empty($value)) {
          $empty = FALSE;
          break;
        }
      }
    }
  }

  // An 'End' date without a 'Start' date is a validation error.
  if ($empty && !empty($item[$to_field])) {
    if (!is_array($item[$to_field])) {
      form_error($element, t("A start date is required if an end date is supplied for field @field #@delta.", array('@delta' => $field['cardinality'] ? intval($delta + 1) : '', '@field' => $instance['label'])));
      $empty = FALSE;
    }
    else {
      foreach ($item[$to_field] as $key => $value) {
        if (!empty($value)) {
          form_error($element, t("A start date is required if an end date is supplied for field @field #@delta.", array('@delta' => $field['cardinality'] ? intval($delta + 1) : '', '@field' => $instance['label'])));
          $empty = FALSE;
          break;
        }
      }
    }
  }

  // If the user chose the option to not show the end date, just swap in the
  // start date as that value so the start and end dates are the same.
  if ($field['settings']['todate'] == 'optional' && empty($item['show_todate'])) {
    $item[$to_field] = $item[$from_field];
    $posted[$to_field] = $posted[$from_field];
  }

  if ($empty) {
    date_element_empty($element, $form_state);
    if (!$element['#required']) {
      return;
    }
  }

  $timezone = !empty($item[$tz_field]) ? $item[$tz_field] : $element['#date_timezone'];
  $timezone_db = date_get_timezone_db($field['settings']['tz_handling']);
  $element[$from_field]['#date_timezone'] = $timezone;
  $from_date = date_input_date($field, $instance, $element[$from_field], $posted[$from_field]);

  if (!empty($field['settings']['todate'])) {
    $element[$to_field]['#date_timezone'] = $timezone;
    $to_date = date_input_date($field, $instance, $element[$to_field], $posted[$to_field]);
  }
  else {
    $to_date = $from_date;
  }

  // Neither the start date nor the end date should be empty at this point
  // unless they held values that couldn't be evaluated.

  if (!$instance['required'] && (!date_is_date($from_date) || !date_is_date($to_date))) {
    date_element_empty($element, $form_state);
    $errors[] = t('The dates are invalid.');
  }
  elseif (!empty($field['settings']['todate']) && $from_date > $to_date) {
    form_set_value($element[$to_field], $to_date, $form_state);
    $errors[] = t('The end date must be greater than the start date.');
  }
  else {
    // Convert input dates back to their UTC values and re-format to ISO
    // or UNIX instead of the DATETIME format used in element processing.
    $item[$tz_field] = $timezone;

    // Update the context for changes in the $item, and allow other modules to
    // alter the computed local dates.
    $context['item'] = $item;
    // We can only pass two additional values to backdrop_alter, so $element
    // needs to be included in $context.
    $context['element'] = $element;
    backdrop_alter('date_combo_validate_date_start', $from_date, $form_state, $context);
    backdrop_alter('date_combo_validate_date_end', $to_date, $form_state, $context);

    $item[$offset_field] = date_offset_get($from_date);

    $test_from = date_format($from_date, 'r');
    $test_to = date_format($to_date, 'r');

    $item[$offset_field2] = date_offset_get($to_date);
    date_timezone_set($from_date, timezone_open($timezone_db));
    date_timezone_set($to_date, timezone_open($timezone_db));
    $item[$from_field] = date_format($from_date, date_type_format($field['type']));
    $item[$to_field] = date_format($to_date, date_type_format($field['type']));

    // If the db timezone is not the same as the display timezone
    // and we are using a date with time granularity,
    // test a roundtrip back to the original timezone to catch
    // invalid dates, like 2AM on the day that spring daylight savings
    // time begins in the US.
    $granularity = date_format_order($element[$from_field]['#date_format']);
    if ($timezone != $timezone_db && date_has_time($granularity)) {
      date_timezone_set($from_date, timezone_open($timezone));
      date_timezone_set($to_date, timezone_open($timezone));

      if ($test_from != date_format($from_date, 'r')) {
        $errors[] = t('The start date is invalid.');
      }
      if ($test_to != date_format($to_date, 'r')) {
        $errors[] = t('The end date is invalid.');
      }
    }
    if (empty($errors)) {
      form_set_value($element, $item, $form_state);
    }
  }

  if (!empty($errors)) {
    if (count($errors) === 1) {
      $error_list = ' ' . reset($errors);
    }
    else {
      $error_list = theme('item_list', array('items' => $errors));
    }
    if ($field['cardinality']) {
      form_error($element, t('There are errors in @field_name value #@delta:', array('@field_name' => $instance['label'], '@delta' => $delta + 1)) . $error_list);
    }
    else {
      form_error($element, t('There are errors in @field_name:', array('@field_name' => $instance['label'])) . $error_list);
    }
  }
}

/**
 * Determine the input format for this element.
 */
function date_input_format($element, $field, $instance) {
  if (!empty($instance['widget']['settings']['input_format_custom'])) {
    return $instance['widget']['settings']['input_format_custom'];
  }
  elseif (!empty($instance['widget']['settings']['input_format']) && $instance['widget']['settings']['input_format'] != 'site-wide') {
    return $instance['widget']['settings']['input_format'];
  }
  $shortformat = system_date_format_load('short');
  return $shortformat['pattern'];
}


/**
 * Implements hook_date_select_pre_validate_alter().
 */
function date_date_select_pre_validate_alter(&$element, &$form_state, &$input) {
  date_empty_end_date($element, $form_state, $input);
}

/**
 * Implements hook_date_text_pre_validate_alter().
 */
function date_date_text_pre_validate_alter(&$element, &$form_state, &$input) {
  date_empty_end_date($element, $form_state, $input);
}

/**
 * Implements hook_date_popup_pre_validate_alter().
 */
function date_date_popup_pre_validate_alter(&$element, &$form_state, &$input) {
  date_empty_end_date($element, $form_state, $input);
}

/**
 * Helper function to clear out end date when not being used.
 */
function date_empty_end_date(&$element, &$form_state, &$input) {
  // If this is the end date and the option to show an end date has not been selected,
  // empty the end date to surpress validation errors and stop further processing.
  $parents = $element['#parents'];
  $parent = array_pop($parents);
  if ($parent == 'value2') {
    $parent_values = backdrop_array_get_nested_value($form_state['values'], $parents);
    if (isset($parent_values['show_todate']) && $parent_values['show_todate'] != 1) {
      $input = array();
      form_set_value($element, NULL, $form_state);
    }
  }
}

/**
 * Determines if the date element needs to be processed.
 *
 * Helper function to see if date element has been hidden by FAPI to see if it
 * needs to be processed or just pass the value through. This is needed since
 * normal date processing expands the date element into parts and then
 * reconstructs it, which is not needed or desirable if the field is hidden.
 *
 * @param array $element
 *   The date element to check.
 *
 * @return bool
 *   TRUE if the element is effectively hidden, FALSE otherwise.
 */
function date_hidden_element($element) {
  if ((isset($element['#access']) && empty($element['#access']))
    || !empty($element['#programmed'])
    || in_array($element['#type'], array('hidden', 'value'))) {
    return TRUE;
  }
  return FALSE;
}
