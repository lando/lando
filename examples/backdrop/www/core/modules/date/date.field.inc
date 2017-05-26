<?php

/**
 * @file
 * Field hooks to implement a date field.
 */

/**
 * Implements hook_field_formatter_info().
 */
function date_field_formatter_info() {
  $formatters = array(
    'date_default' => array(
      'label' => t('Date and time'),
      'field types' => array('date', 'datestamp', 'datetime'),
      'settings' => array(
        'format_type' => 'long',
        'multiple_number' => '',
        'multiple_from' => '',
        'multiple_to' => '',
        'fromto' => 'both',
        'show_remaining_days' => FALSE,
      ),
    ),
    'format_interval' => array(
      'label' => t('Time ago'),
      'field types' => array('date', 'datestamp', 'datetime'),
      'settings' => array(
        'interval' => 2,
        'interval_display' => 'time ago',
      ),
    ),
    'date_plain' => array(
      'label' => t('Plain'),
      'field types' => array('date', 'datestamp', 'datetime'),
    ),
  );
  return $formatters;
}

/**
 * Implements hook_field_formatter_settings_form().
 */
function date_field_formatter_settings_form($field, $instance, $view_mode, $form, &$form_state) {
  $display = $instance['display'][$view_mode];
  $formatter = $display['type'];
  module_load_include('inc', 'date', 'date.admin');
  switch ($formatter) {
    case 'format_interval':
      $form = date_interval_formatter_settings_form($field, $instance, $view_mode, $form, $form_state);
      break;

    default:
      $form = date_default_formatter_settings_form($field, $instance, $view_mode, $form, $form_state);
      break;
  }
  $context = array(
    'field' => $field,
    'instance' => $instance,
    'view_mode' => $view_mode,
  );
  backdrop_alter('date_field_formatter_settings_form', $form, $form_state, $context);
  return $form;
}

/**
 * Implements hook_field_formatter_settings_summary().
 */
function date_field_formatter_settings_summary($field, $instance, $view_mode) {
  $display = $instance['display'][$view_mode];
  $formatter = $display['type'];
  module_load_include('inc', 'date', 'date.admin');
  switch ($formatter) {
    case 'format_interval':
      $summary = date_interval_formatter_settings_summary($field, $instance, $view_mode);
      break;

    default:
      $summary = date_default_formatter_settings_summary($field, $instance, $view_mode);
      break;
  }
  $context = array(
    'field' => $field,
    'instance' => $instance,
    'view_mode' => $view_mode,
  );
  backdrop_alter('date_field_formatter_settings_summary', $summary, $context);

  return implode('<br />', $summary);
}

/**
 * Implements hook_field_formatter_view().
 *
 * Useful values:
 *
 *   $entity->date_id
 *     If set, this will show only an individual date on a field with
 *     multiple dates. The value should be a string that contains
 *     the following values, separated with periods:
 *     - module name of the module adding the item
 *     - node nid
 *     - field name
 *     - delta value of the field to be displayed
 *     - other information the module's custom theme might need
 *
 *     Used by the calendar module and available for other uses.
 *     example: 'date:217:field_date:3:test'
 *
 *   $entity->date_repeat_show_all
 *     If true, tells the theme to show all the computed values
 *     of a repeating date. If not true or not set, only the
 *     start date and the repeat rule will be displayed.
 */
function date_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {
  $element = array();
  $settings = $display['settings'];
  $formatter = $display['type'];
  $variables = array(
    'entity' => $entity,
    'entity_type' => $entity_type,
    'field' => $field,
    'instance' => $instance,
    'langcode' => $langcode,
    'items' => $items,
    'display' => $display,
    'dates' => array(),
    'attributes' => array(),
  );

  // Give other modules a chance to prepare the entity before formatting it.
  backdrop_alter('date_formatter_pre_view', $entity, $variables);

  // See if we are only supposed to display a selected
  // item from multiple value date fields.
  $selected_deltas = array();
  if (!empty($entity->date_id)) {
    foreach ((array) $entity->date_id as $key => $id) {
      list($module, $nid, $field_name, $selected_delta, $other) = explode('.', $id . '.');
      if ($field_name == $field['field_name']) {
        $selected_deltas[] = $selected_delta;
      }
    }
  }

  switch ($display['type']) {
    case 'date_plain':
      foreach ($items as $delta => $item) {
        if (!empty($entity->date_id) && !in_array($delta, $selected_deltas)) {
          continue;
        }
        else {
          if (empty($item['value2']) || $item['value'] == $item['value2']) {
            $element[$delta] = array('#markup' => $item['value']);
          }
          else {
            $element[$delta] = array(
              '#markup' => t('!start-date to !end-date', array(
                '!start-date' => $item['value'],
                '!end-date' => $item['value2']
              )));
          }
        }
      }
      break;

    case 'format_interval':
      foreach ($items as $delta => $item) {
        if (!empty($entity->date_id) && !in_array($delta, $selected_deltas)) {
          continue;
        }
        else {
          $variables['delta'] = $delta;
          $variables['item'] = $item;
          $variables['dates'] = date_formatter_process($formatter, $entity_type, $entity, $field, $instance, $langcode, $item, $display);
          $variables['attributes'] = array();
          $element[$delta] = array('#markup' => theme('date_display_interval', $variables));
        }
      }
      break;

    default:
      foreach ($items as $delta => $item) {
        if (!empty($entity->date_id) && !in_array($delta, $selected_deltas)) {
          continue;
        }
        else {
          $variables['delta'] = $delta;
          $variables['item'] = $item;
          $variables['dates'] = date_formatter_process($formatter, $entity_type, $entity, $field, $instance, $langcode, $item, $display);
          $variables['attributes'] = array();
          $variables['show_remaining_days'] = $display['settings']['show_remaining_days'];
          $output = theme('date_display_combination', $variables);
          if (!empty($output)) {
            $element[$delta] = array('#markup' => $output);
          }
        }
      }
      break;
  }
  return $element;
}

/**
 * Implements hook_field_is_empty().
 */
function date_field_is_empty($item, $field) {
  // Sometimes a $item is a date object.
  // Coming from repeating dates. Why??
  if (!is_array($item)) {
    return FALSE;
  }
  if (empty($item['value'])) {
    return TRUE;
  }
  elseif ($field['settings']['todate'] == 'required' && empty($item['value2'])) {
    return TRUE;
  }
  return FALSE;
}

/**
 * Implements hook_field_info().
 */
function date_field_info() {
  $granularity = array('year', 'month', 'day', 'hour', 'minute');
  $settings = array(
    'settings' => array(
      'todate' => '',
      'granularity' => backdrop_map_assoc($granularity),
      'tz_handling' => 'site',
      'timezone_db' => 'UTC',
    ),
    'instance_settings' => array(
      'default_value' => 'blank',
      'default_value_code' => '',
      'default_value2' => 'same',
      'default_value_code2' => '',
    ),
  );
  return array(
    'datetime' => array(
      'label' => 'Date',
      'description' => t('Store a date in the database as a datetime field, recommended for complete dates and times that may need timezone conversion.'),
      'default_widget' => 'date_select',
      'default_formatter' => 'date_default',
      'default_token_formatter' => 'date_plain',
    ) + $settings,
    'date' => array(
      'label' => 'Date (ISO format)',
      'description' => t('Store a date in the database as an ISO date, recommended for historical or partial dates.'),
      'default_widget' => 'date_select',
      'default_formatter' => 'date_default',
      'default_token_formatter' => 'date_plain',
    ) + $settings,
    'datestamp' => array(
      'label' => 'Date (Unix timestamp)',
      'description' => t('Store a date in the database as a timestamp, deprecated format to support legacy data.'),
      'default_widget' => 'date_select',
      'default_formatter' => 'date_default',
      'default_token_formatter' => 'date_plain',
    ) + $settings,
  );
}

/**
 * Implements hook_field_widget_info().
 */
function date_field_widget_info() {
  $settings = array(
    'settings' => array(
      'input_format' => date_default_format('date_select'),
      'input_format_custom' => '',
      'increment' => 1,
      'text_parts' => array(),
      'year_range' => '-3:+3',
      'label_position' => 'none',
      'no_fieldset' => TRUE,
    ),
    'behaviors' => array(
      'multiple values' => FIELD_BEHAVIOR_DEFAULT,
      'default value' => FIELD_BEHAVIOR_NONE,
    ),
  );

  $info = array(
    'date_popup' => array(
      'label' => t('Pop-up calendar'),
      'field types' => array('date', 'datestamp', 'datetime'),
    ) + $settings,
    'date_select' => array(
      'label' => t('Select list'),
      'field types' => array('date', 'datestamp', 'datetime'),
    ) + $settings,
    'date_text' => array(
      'label' => t('Text field'),
      'field types' => array('date', 'datestamp', 'datetime'),
    ) + $settings,
  );

  // Add the fieldset option for select fields only.
  $info['date_select']['settings']['no_fieldset'] = FALSE;

  return $info;
}

/**
 * Implementation of hook_field_widget_form().
 *
 * The widget builds out a complex date element in the following way:
 *
 * - A field is pulled out of the database which is comprised of one or
 *   more collections of start/end dates.
 *
 * - The dates in this field are all converted from the UTC values stored
 *   in the database back to the local time. This is done in #process
 *   to avoid making this change to dates that are not being processed,
 *   like those hidden with #access.
 *
 * - If values are empty, the field settings rules are used to determine
 *   if the default_values should be empty, now, the same, or use strtotime.
 *
 * - Each start/end combination is created using the date_combo element type
 *   defined by the date module. If the timezone is date-specific, a
 *   timezone selector is added to the first combo element.
 *
 * - The date combo element creates two individual date elements, one each
 *   for the start and end field, using the appropriate individual Date API
 *   date elements, like selects, textfields, or popups.
 *
 * - In the individual element validation, the data supplied by the user is
 *   used to update the individual date values.
 *
 * - In the combo date validation, the timezone is updated, if necessary,
 *   then the user input date values are used with that timezone to create
 *   date objects, which are used update combo date timezone and offset values.
 *
 * - In the field's submission processing, the new date values, which are in
 *   the local timezone, are converted back to their UTC values and stored.
 */
function date_field_widget_form(&$form, &$form_state, $field, $instance, $langcode, $items, $delta, $base) {
  module_load_include('inc', 'date', 'date.elements');

  $element = $base;

  // If this is a new entity, populate the field with the right default values.
  // This happens early so even fields later hidden with #access get those values.
  // We should only add default values to new entities, to avoid over-writing
  // a value that has already been set. This means we can't just check to see
  // if $items is empty, because it might have been set that way on purpose.
  // @see date_field_widget_properties_alter() where we flagged if this is a new entity.

  // We check !isset($items[$delta]['value']) because entity translation may create
  // a new translation entity for an existing entity and we don't want to clobber
  // values that were already set in that case.
  // @see http://drupal.org/node/1478848.

  $is_default = FALSE;
  if (!empty($instance['widget']['is_new']) && !isset($items[$delta]['value'])) {
    $items = date_default_value($field, $instance, $langcode);
    $is_default = TRUE;
  }

  $timezone = date_get_timezone($field['settings']['tz_handling'], isset($items[$delta]['timezone']) ? $items[$delta]['timezone'] : date_default_timezone());

  // TODO see if there's a way to keep the timezone element from ever being
  // nested as array('timezone' => 'timezone' => value)). After struggling
  // with this a while, I can find no way to get it displayed in the form
  // correctly and get it to use the timezone element without ending up
  // with nesting.
  if (is_array($timezone)) {
    $timezone = $timezone['timezone'];
  }

  $element += array(
    '#type' => 'date_combo',
    '#theme_wrappers' => array('date_combo'),
    '#weight' => $delta,
    '#default_value' => isset($items[$delta]) ? $items[$delta] : '',
    '#date_timezone' => $timezone,
    '#element_validate' => array('date_combo_validate'),
    '#date_is_default' => $is_default,

    // Store the original values, for use with disabled and hidden fields.
    '#date_items' => isset($items[$delta]) ? $items[$delta] : '',
  );

  if ($field['settings']['tz_handling'] == 'date') {
    $element['timezone'] = array(
      '#type' => 'date_timezone',
      '#theme_wrappers' => array('date_timezone'),
      '#delta' => $delta,
      '#default_value' => $timezone,
      '#weight' => $instance['widget']['weight'] + 1,
      '#date_label_position' => $instance['widget']['settings']['label_position'],
    );
  }

  // Make changes if instance is set to be rendered as a regular field.
  if ($instance['widget']['settings']['no_fieldset']) {
    $element['#title'] = NULL;
    $element['#theme_wrappers'] = array();
    $element['#date_title_printed'] = FALSE;
  }
  else {
    $element['#title'] = $instance['label'];
    $element['#date_title_printed'] = TRUE;
  }

  return $element;
}

/**
 * Implements hook_field_load().
 */
function date_field_load($entity_type, $entities, $field, $instances, $langcode, &$items, $age) {
  $timezone_db = date_get_timezone_db($field['settings']['tz_handling']);
  $db_format = date_type_format($field['type']);
  $process = date_process_values($field);
  foreach ($entities as $id => $entity) {
    foreach ($items[$id] as $delta => &$item) {
      // If the file does not exist, mark the entire item as empty.
      if (is_array($item)) {
        $timezone = isset($item['timezone']) ? $item['timezone'] : '';
        $item['timezone'] = date_get_timezone($field['settings']['tz_handling'], $timezone);
        $item['timezone_db'] = $timezone_db;
        $item['date_type'] = $field['type'];
        if (!empty($field['settings']['cache_enabled']) && ($delta < $field['settings']['cache_count'] || $field['settings']['cache_count'] == 0)) {
          foreach ($process as $processed) {
            if (!empty($item[$processed])) {
              $date = new BackdropDateTime($item[$processed], $item['timezone_db'], $db_format);
              $date->limitGranularity($field['settings']['granularity']);
              $item['db'][$processed] = $date;
            }
          }
          if (!empty($item['db']['value']) && empty($item['db']['value2'])) {
            $item['db']['value2'] = $item['db']['value'];
          }
        }
      }
    }
  }
}

/**
 * Implements hook_field_validate().
 */
function date_field_validate($entity_type, $entity, $field, $instance, $langcode, $items, &$errors) {
  $flexible = 0;

  // Don't try to validate if there were any errors before this point
  // since the element won't have been munged back into a date.
  if (!form_get_errors()) {
    foreach ($items as $delta => $item) {
      if (is_array($item) && isset($item['value'])) {
        $process = date_process_values($field, $instance);
        $timezone = !empty($item['timezone']) ? $item['timezone'] : NULL;
        $date1 = new BackdropDateTime($item['value'], $timezone, date_type_format($field['type']));
        if (count($process) == 1 || (empty($item['value2']) && $item['value2'] !== 0)) {
          $date2 = clone($date1);
        }
        else {
          $date2 = new BackdropDateTime($item['value2'], $timezone, date_type_format($field['type']));
        }
        $valid1 = $date1->validGranularity($field['settings']['granularity'], $flexible);
        $valid2 = $date2->validGranularity($field['settings']['granularity'], $flexible);

        foreach ($process as $processed) {
          if ($processed == 'value' && $field['settings']['todate'] && !$valid1 && $valid2) {
            $errors[$field['field_name']][$langcode][$delta][] = array(
              'error' => 'value',
              'message' => t("A 'Start date' date is required for field %field #%delta.", array('%delta' => $field['cardinality'] ? intval($delta + 1) : '', '%field' => $instance['label'])),
            );
          }
          if ($processed == 'value2' && $field['settings']['todate'] == 'required' && ($instance['required'] && $valid1 && !$valid2)) {
            $errors[$field['field_name']][$langcode][$delta][] = array(
              'error' => 'value2',
              'message' => t("An 'End date' is required for field %field #%delta.", array('%delta' => $field['cardinality'] ? intval($delta + 1) : '', '%field' => $instance['label'])),
            );
          }
        }
      }
    }
  }
}

/**
 * Implements hook_field_insert().
 */
function date_field_presave($entity_type, $entity, $field, $instance, $langcode, &$items) {
  if (empty($items)) {
    return;
  }
  // Add some information needed to interpret token values.
  $values = $items;
  foreach ($values as $delta => $item) {
    $timezone = isset($item['timezone']) ? $item['timezone'] : '';
    if (is_array($item)) {
      $items[$delta]['timezone'] = date_get_timezone($field['settings']['tz_handling'], $timezone);
      $items[$delta]['timezone_db'] = date_get_timezone_db($field['settings']['tz_handling']);
      $items[$delta]['date_type'] = $field['type'];
    }
  }
  $entity->{$field['field_name']}[$langcode] = $items;
}

/**
 * Implements hook_field_insert().
 */
function date_field_insert($entity_type, $entity, $field, $instance, $langcode, &$items) {
  $context = array(
    'entity_type' => $entity_type,
    'entity' => $entity,
    'field' => $field,
    'instance' => $instance,
    'langcode' => $langcode,
  );
  backdrop_alter('date_field_insert', $items, $context);
}

/**
 * Implements hook_field_update().
 */
function date_field_update($entity_type, $entity, $field, $instance, $langcode, &$items) {
  $context = array(
    'entity_type' => $entity_type,
    'entity' => $entity,
    'field' => $field,
    'instance' => $instance,
    'langcode' => $langcode,
  );
  backdrop_alter('date_field_update', $items, $context);
}

/**
 * Implements hook_field_instance_settings_form().
 *
 * Wrapper functions for date administration, included only when processing
 * field settings.
 */
function date_field_instance_settings_form($field, $instance) {
  module_load_include('inc', 'date', 'date.admin');
  return _date_field_instance_settings_form($field, $instance);
}

/**
 * Implements hook_field_widget_settings_form().
 */
function date_field_widget_settings_form($field, $instance) {
  module_load_include('inc', 'date', 'date.admin');
  return _date_field_widget_settings_form($field, $instance);
}

/**
 * Implements hook_field_settings_form().
 */
function date_field_settings_form($field, $instance, $has_data) {
  module_load_include('inc', 'date', 'date.admin');
  return _date_field_settings_form($field, $instance, $has_data);
}
